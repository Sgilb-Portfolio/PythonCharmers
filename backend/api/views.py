from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection, transaction
from django.contrib.auth import authenticate
from .models import AboutData
from django.views.decorators.csrf import csrf_exempt   
import jwt
from django.contrib.auth.hashers import make_password
from datetime import datetime, timedelta
from rest_framework_simplejwt.tokens import RefreshToken 
from django.conf import settings  # For SECRET_KEY
from rest_framework import status  # For HTTP status codes
from django.contrib.auth.hashers import make_password
import json     
from django.utils.timezone import now                                        
from .models import Account 
from .models import Points
from .cognito_auth import sign_up, sign_in, verify_token, confirm_sign_up
from .cognito_auth import reset_password as cognito_reset_password
from .cognito_auth import forgot_password as cognito_forgot_password
from .cognito_auth import verify_mfa_code as cognito_verify_mfa
from .models import FailedLoginAttempts
import requests
from .models import Prof
from .cloudwatch_logs import get_audit_logs
from django.views.decorators.http import require_GET
from django.contrib.auth.decorators import login_required
from .models import Sponsor
from .models import Application
from .models import SponsorUser
from django.db.models import Max
from .models import DriverSponsor
from .models import CatalogItem
from .models import SponsorCatalogItem
from .models import CartItem
from .models import Purchase
from .models import PurchaseSummary
from uuid import uuid4

MAX_ATTEMPTS = 3
LOCKOUT_DURATION = timedelta(minutes=1)

@csrf_exempt
def about(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT DATABASE();")
            db_name = cursor.fetchone()
        return JsonResponse({"message": "Connected to DB", "database": db_name[0]})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@csrf_exempt    
def get_aboutdata(request):
    try:
        data = AboutData.objects.first()
        response_data = {
            "teamNum": data.teamnum,
            "versionNum": data.versionnum,
            "releaseDate": data.releasedate,
            "productName": data.productname,
            "productDesc": data.productdesc
        }
        return JsonResponse(response_data)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@csrf_exempt
def create_account(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)  # Parse incoming JSON data
            username = data.get('username')
            password = data.get('password')  # Ideally, hash this before saving

            # Check if username already exists
            if Account.objects.filter(account_username=username).exists():
                return JsonResponse({'error': 'Username already taken'}, status=400)

            hashed_password = make_password(password)

            # Create account with default values
            account = Account.objects.create(
                account_type="Driver",  # Default type
                account_username=username,
                account_password=hashed_password
            )

            return JsonResponse({'message': 'Account created', 'account_id': account.account_id}, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt 
def login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
            try:
                user = Account.objects.get(account_username=username)
                if user.account_password == password:
                    payload = {
                        'id': user.account_id,
                        'username': user.account_username,
                        'exp': datetime.utcnow() + timedelta(days=1),
                    }
                    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
                    return JsonResponse({"token": token, "message": "Login successful!"}, status=status.HTTP_200_OK)
                else:
                    return JsonResponse({"error": "Invalid credentials"}, status=401)
            except Account.DoesNotExist:
                return JsonResponse({"error": "User not found"}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


"""Cognito functions"""
@csrf_exempt
def register_user(request):
    """Handles user registration"""
    if request.method == "POST":
        data = json.loads(request.body)
        response = sign_up(data["username"], data["password"], data["email"])
        print("response:", response)
        return JsonResponse(response)
    
@csrf_exempt
def confirm_user(request):
    """Handles user confirmation after sign-up"""
    if request.method == "POST":
        data = json.loads(request.body)
        response = confirm_sign_up(data["username"], data["confirmation_code"])
        return JsonResponse(response)
    
@csrf_exempt
def login_user(request):
    """Handles user login and returns JWT tokens"""
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        try:
            failed_attempt = FailedLoginAttempts.objects.get(username=username)
        except FailedLoginAttempts.DoesNotExist:
            failed_attempt = None
        if failed_attempt and failed_attempt.lockout_until and failed_attempt.lockout_until > now():
            return JsonResponse({
                "error": "Account locked. Try again later.",
                "lockout_until": failed_attempt.lockout_until.strftime("%Y-%m-%d %H:%M:%S")
            }, status=403)
        auth_result = sign_in(data["username"], data["password"])
        if "challenge" in auth_result:
            if failed_attempt:
                failed_attempt.failed_attempts = 0
                failed_attempt.lockout_until = None
                failed_attempt.save()
            return JsonResponse(auth_result, status=202)
        if "error" in auth_result:
            remaining_attempts = None
            if failed_attempt:
                remaining_attempts = MAX_ATTEMPTS - failed_attempt.failed_attempts
            response_data = {"error": "Invalid credentials"}
            if remaining_attempts is not None:
                response_data["remaining_attempts"] = remaining_attempts
            return JsonResponse(response_data, status=401)
        if failed_attempt:
            failed_attempt.failed_attempts = 0
            failed_attempt.lockout_until = None
            failed_attempt.save()
        return JsonResponse(auth_result)

@csrf_exempt 
def reset_password(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get("username", "").strip()
        new_password = data.get("new_password", "")
        verification_code = data.get("verification_code", "")

        if not username or not new_password or not verification_code:
            return JsonResponse({"error": "All fields are required"}, status=400)

        # Check if user exists in the database
        try:
            user = Account.objects.get(account_username=username)
        except Account.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

        # Call Cognito function
        cognito_response = cognito_reset_password(username, new_password, verification_code)

        if "error" in cognito_response:
            return JsonResponse(cognito_response, status=400)
        
        hashed_password = make_password(new_password)

        # Update password in local database
        user.account_password = hashed_password
        user.save()

        return JsonResponse({"message": "Password reset successful"}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)
    
@csrf_exempt
def forgot_password(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get("username", "").strip()

        if not username:
            return JsonResponse({"error": "Username is required"}, status=400)

        # Call Cognito forgot password function
        cognito_response = cognito_forgot_password(username)

        if "error" in cognito_response:
            return JsonResponse(cognito_response, status=400)

        return JsonResponse({"message": "Password reset code sent to user's email"}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)

@csrf_exempt
def protected_view(request):
    """Example protected route that requires a valid token"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JsonResponse({"error": "Missing or invalid token"}, status=401)
    token = auth_header.split(" ")[1]
    user_info = verify_token(token)
    if "error" in user_info:
        return JsonResponse(user_info, status=401)
    return JsonResponse({"message": "Access granted!", "user": user_info})

@csrf_exempt
def verify_mfa(request):
    """Handles MFA code verification and returns JWT tokens if successful"""
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)
    try:
        data = json.loads(request.body)
        username = data.get("username", "").strip()
        mfa_code = data.get("mfa_code", "").strip()
        session = data.get("session", "").strip()
        if not username or not mfa_code or not session:
            return JsonResponse({"error": "All fields are required"}, status=400)
        auth_result = cognito_verify_mfa(username, mfa_code, session)
        if "error" in auth_result:
            return JsonResponse(auth_result, status=401)
        return JsonResponse(auth_result, status=200)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)

"""cognito functions end"""

@csrf_exempt
def get_points(request):
    """Returns a list of all drivers with their points for a specific sponsor"""
    if request.method == "GET":
        username = request.GET.get("username")
        if not username:
            return JsonResponse({"error": "Sponsor username is required"}, status=400)
        try:
            account = Account.objects.get(account_username=username)
            sponsorUser = SponsorUser.objects.get(account_id=account.account_id)
            sponsor = Sponsor.objects.get(sponsor_id=sponsorUser.sponsor_id)
            drivers = Points.objects.filter(sponsor_id=sponsor.sponsor_id).values("driver_id", "driver_username", "driver_points")
            return JsonResponse({"drivers": list(drivers)})
        except Sponsor.DoesNotExist:
            return JsonResponse({"error": "Sponsor not found"}, status=404)


@csrf_exempt
def update_points(request):
    """Updates the points for a specific driver"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            points_to_add = data.get("points", 0)
            sponsor_user = data.get("sponsor_user")
            account = Account.objects.get(account_username=sponsor_user)
            sponsorUser = SponsorUser.objects.get(account_id=account.account_id)
            sponsor = Sponsor.objects.get(sponsor_id=sponsorUser.sponsor_id)
            points = Points.objects.get(driver_username=username, sponsor_id=sponsor.sponsor_id)
            points.driver_points += points_to_add
            points.save()
            return JsonResponse({"message": "Points updated successfully", "new_points": points.driver_points})
        except Points.DoesNotExist:
            return JsonResponse({"error": "Driver not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def itunes_search(request):
    # default search data
    search_term = request.GET.get("term", "Taylor Swift")
    media_type = request.GET.get("media", "music")
    limit = int(request.GET.get('limit', 10))

    itunes_url = f"https://itunes.apple.com/search?term={search_term}&media={media_type}&limit={limit}"

    response = requests.get(itunes_url)
    if response.status_code == 200:
        data = response.json()
        formatted_results = []

        for item in data["results"]:
            formatted_results.append({
                "name": item.get("trackName", item.get("collectionName", "N/A")),
                "creator": item.get("artistName", item.get("collectionArtistName", "N/A")),
                "type": item.get("kind", media_type),
                "image": item.get("artworkUrl100", ""),
                "price": item.get("trackPrice", item.get("collectionPrice", "N/A")),
                "currency": item.get("currency", ""),
                "availability": "Available" if "trackPrice" in item or "collectionPrice" in item else "Not Available",
                "link": item.get("trackViewUrl", item.get("collectionViewUrl", "")),
            })

        return JsonResponse({
            "results": formatted_results,
            "limit": limit,  # Include the limit in the response
        }, safe=False)
    return JsonResponse({"error": "Failed to fetch data"}, status=500)

@csrf_exempt
def get_profile(request, username):
    """Fetches the user profile data based on the username"""
    try:
        account = Account.objects.get(account_username=username)
        user_profile = Prof.objects.get(account_id=account.account_id)
        response_data = {
            "prof_fname": user_profile.prof_fname,
            "prof_lname": user_profile.prof_lname,
            "prof_ph_number": user_profile.prof_ph_number,
            "prof_email": user_profile.prof_email,
            "prof_pic_url": user_profile.prof_pic_url,
            "prof_updated_at": user_profile.prof_updated_at,
            "prof_bio": user_profile.prof_bio
        }
        return JsonResponse(response_data)
    except Account.DoesNotExist:
        return JsonResponse({"error": "Account not found"}, status=404)
    except Prof.DoesNotExist:
        return JsonResponse({"error": "User profile not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@csrf_exempt
def update_profile(request, username):
    """Updates the user profile data based on the username"""
    if request.method == 'PUT':
        try:
            account = Account.objects.get(account_username=username)
            user_profile = Prof.objects.get(account_id=account.account_id)
            data = json.loads(request.body)
            first_name = data.get('first_name', None)
            last_name = data.get('last_name', None)
            phone_number = data.get('phone_number', None)
            bio = data.get('bio', None)
            if first_name:
                user_profile.prof_fname = first_name
            if last_name:
                user_profile.prof_lname = last_name
            if phone_number:
                user_profile.prof_ph_number = phone_number
            if bio:
                user_profile.prof_bio = bio
            user_profile.save()
            response_data = {
                "prof_fname": user_profile.prof_fname,
                "prof_lname": user_profile.prof_lname,
                "prof_ph_number": user_profile.prof_ph_number,
                "prof_bio": user_profile.prof_bio,
                "prof_updated_at": user_profile.prof_updated_at,
            }
            return JsonResponse(response_data)
        except Account.DoesNotExist:
            return JsonResponse({"error": "Account not found"}, status=404)
        except Prof.DoesNotExist:
            return JsonResponse({"error": "User profile not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def audit_logs_view(request):
    log_group = request.GET.get('logGroup')

    if not log_group:
        return JsonResponse({'error': 'Missing logGroup parameter'}, status=400)

    try:
        logs = get_audit_logs(log_group)
        return JsonResponse(logs, safe=False)
    except Exception as e:
        print(f'Error fetching logs: {e}')
        return JsonResponse({'error': 'Failed to fetch logs from CloudWatch'}, status=500)

@csrf_exempt
def get_driver_points_by_username(request, username):
    """
    GET /api/get-driver-points/<username>
    Returns a list of point records for a driver grouped by sponsor.
    """
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        point_entries = Points.objects.filter(driver_username=username).select_related("sponsor")

        if not point_entries.exists():
            return JsonResponse({
                "success": False,
                "error": "Driver not found"
            }, status=404)

        sponsor_points = [
            {
                "sponsor_id": entry.sponsor.sponsor_id,
                "sponsor_name": entry.sponsor.sponsor_name,
                "points": entry.driver_points
            }
            for entry in point_entries
        ]

        return JsonResponse({
            "success": True,
            "sponsor_points": sponsor_points
        })
    except Exception as e:
        print(f"Error fetching driver points: {str(e)}")
        return JsonResponse({
            "success": False,
            "error": "Internal server error"
        }, status=500)

@csrf_exempt
@require_GET
def view_as_driver(request, driver_id):
    try:
        driver = Points.objects.get(driver_id=driver_id)
        driver_data = {
            "driver_id": driver.driver_id,
            "username": driver.driver_username,
            "points": driver.driver_points
        }
        return JsonResponse({
            "view_as": "driver",
            "data": driver_data
        })
    except Points.DoesNotExist:
        return JsonResponse({"error": "Driver not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def reports_view(request):
    """
    API view for generating various reports from CloudWatch logs
    """
    # Get parameters from request
    report_type = request.GET.get('report_type', 'driver_activity')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    username = request.GET.get('username')
    
    # Determine which log group to query based on report type
    log_group = None
    if report_type == 'driver_activity':
        log_group = '/driver-points/audit-logs'  # Using your existing audit logs that contain driver activities
    elif report_type == 'point_transactions':
        log_group = '/driver-points/audit-logs'  # Same log group, but will filter for point transactions
    elif report_type == 'login_summary':
        log_group = 'Team06-Cognito-Cloudtrail-AuditLogs'  # Using your Cognito logs for login data
    elif report_type == 'system_usage':
        log_group = 'Team06-Cognito-Cloudtrail-AuditLogs'  # Same logs, filtered for system usage
    elif report_type == 'security_events':
        log_group = 'Team06-Cognito-Cloudtrail-AuditLogs'  # Same logs, filtered for security events
    else:
        return JsonResponse({'error': 'Invalid report type'}, status=400)
    
    try:
        # Use your existing get_audit_logs function
        logs = get_audit_logs(log_group)
        
        # Post-process the logs based on report type and filters
        filtered_logs = []
        for log in logs:
            # Parse the log message to extract needed data
            try:
                message = json.loads(log.get('message', '{}'))
                
                # Filter by username if specified
                if username and message.get('driver_username') != username and message.get('username') != username:
                    continue
                
                # Filter by date range if specified
                log_timestamp = log.get('timestamp')
                if start_date and log_timestamp < start_date:
                    continue
                if end_date and log_timestamp > end_date:
                    continue
                
                # Filter and transform based on report type
                if report_type == 'point_transactions' and 'point_change' in message:
                    filtered_logs.append({
                        'timestamp': log_timestamp,
                        'username': message.get('driver_username', message.get('username', 'Unknown')),
                        'point_change': message.get('point_change'),
                        'reason': message.get('reason', 'Not specified'),
                        'current_points': message.get('current_points', 0)
                    })
                elif report_type == 'driver_activity':
                    # Include all driver activity logs
                    filtered_logs.append({
                        'timestamp': log_timestamp,
                        'username': message.get('driver_username', message.get('username', 'Unknown')),
                        'activity_type': message.get('activity_type', message.get('event_type', 'Unknown')),
                        'point_change': message.get('point_change', 0),
                        'details': message.get('details', 'No details provided')
                    })
                elif report_type == 'login_summary' and message.get('eventType') in ['SignIn', 'SignOut']:
                    # Process login events
                    filtered_logs.append({
                        'timestamp': log_timestamp,
                        'username': message.get('userName', 'Unknown'),
                        'event_type': message.get('eventType'),
                        'success': message.get('eventResponse') == 'Pass'
                    })
                # Add other report types as needed
            
            except json.JSONDecodeError:
                # Skip logs with invalid JSON
                continue
        
        # Return the filtered and processed logs
        return JsonResponse(filtered_logs, safe=False)
    
    except Exception as e:
        print(f'Error generating report: {e}')
        return JsonResponse({'error': f'Failed to generate report: {str(e)}'}, status=500)
=======
@csrf_exempt    
def get_sponsors(request):
    sponsors = Sponsor.objects.all()
    data = [
        {
            "sponsor_id": sponsor.sponsor_id,
            "sponsor_name": sponsor.sponsor_name,
        }
        for sponsor in sponsors
    ]
    return JsonResponse(data, safe=False)

@csrf_exempt
def get_sponsor_details(request, sponsor_id):
    try:
        sponsor = Sponsor.objects.get(sponsor_id=sponsor_id)
        data = {
            "sponsor_id": sponsor.sponsor_id,
            "sponsor_name": sponsor.sponsor_name,
            "sponsor_rules": sponsor.sponsor_rules,
            "sponsor_pt_amt": str(sponsor.sponsor_pt_amt),
        }
        return JsonResponse(data)
    except Sponsor.DoesNotExist:
        return JsonResponse({
            "error": "Sponsor not found"
        }, status=404)
   
@csrf_exempt
def apply_sponsor(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get('username')
        sponsor_id = data.get('sponsor_id')
        status = data.get('status', 'pending')
        try:
            user = Account.objects.get(account_username=username)
            sponsor = Sponsor.objects.get(pk=sponsor_id)
            latest_app = Application.objects.filter(
                account_username=user,
                sponsor=sponsor
            ).order_by('-application_at').first()
            if latest_app and latest_app.application_status not in ["rejected", "canceled"]:
                return JsonResponse({'message': 'You have already applied to this sponsor and must wait for a response or cancel the application.'}, status=400)
            application = Application(
                account_username=user,
                sponsor=sponsor,
                application_status=status,
                application_at=datetime.now()
            )
            application.save()
            return JsonResponse({'message': 'Application submitted successfully!'}, status=201)
        except Account.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Sponsor.DoesNotExist:
            return JsonResponse({'error': 'Sponsor not found'}, status=404)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def get_sponsor_applications(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get('username')
            if not username:
                return JsonResponse({'error': 'Username is required'}, status=400)
            try:
                account = Account.objects.get(account_username=username)
            except Account.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)
            sponsor_ids = SponsorUser.objects.filter(account=account).values_list('sponsor_id', flat=True)
            applications = Application.objects.filter(sponsor_id__in=sponsor_ids, application_status='pending')
            results = [
                {
                    'application_id': app.application_id,
                    'driver': app.account_username.account_username,
                    'sponsor': app.sponsor.sponsor_name,
                    'status': app.application_status,
                    'applied_at': app.application_at.strftime("%Y-%m-%d %H:%M:%S"),
                }
                for app in applications
            ]
            return JsonResponse(results, safe=False, status=200)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    
@csrf_exempt
def update_application_status(request):
    if request.method == "POST":
        data = json.loads(request.body)
        app_id = data.get("application_id")
        new_status = data.get("status")
        try:
            app = Application.objects.get(pk=app_id)
            app.application_status = new_status
            app.save()
            return JsonResponse({"message": "Status updated"})
        except Application.DoesNotExist:
            return JsonResponse({"error": "Application not found"}, status=404)
    return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt
def get_driver_applications(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get('username')
        try:
            user = Account.objects.get(account_username=username)
            latest_app_dates = Application.objects.filter(account_username=user)\
                .values('sponsor_id')\
                .annotate(latest_date=Max('application_at'))
            latest_apps = Application.objects.filter(
                account_username=user,
                sponsor_id__in=[entry['sponsor_id'] for entry in latest_app_dates],
                application_at__in=[entry['latest_date'] for entry in latest_app_dates]
            ).select_related('sponsor')
            data = [{
                'sponsor_name': app.sponsor.sponsor_name,
                'status': app.application_status,
                'submitted_at': app.application_at
            } for app in latest_apps]
            return JsonResponse(data, safe=False)
        except Account.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def confirm_join_sponsor(request):
    if request.method == "POST":
        data = json.loads(request.body)
        sponsor_name = data.get("sponsor_name")
        username = data.get("username")
        if not sponsor_name or not username:
            return JsonResponse({"error": "Sponsor name and username are required"}, status=400)
        try:
            user = Account.objects.get(account_username=username)
            sponsor = Sponsor.objects.get(sponsor_name=sponsor_name)
            application = Application.objects.filter(account_username=user, sponsor=sponsor).order_by('-application_at').first()
            if application.application_status != "accepted":
                return JsonResponse({"error": "You can only join sponsors from accepted applications."}, status=400)
            application.application_status = "joined"
            application.save()
            return JsonResponse({"message": "You have successfully joined the sponsor!"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def cancel_application(request):
    if request.method == "POST":
        data = json.loads(request.body)
        sponsor_name = data.get("sponsor_name")
        username = data.get("username")
        if not sponsor_name or not username:
            return JsonResponse({"error": "Sponsor name and username are required"}, status=400)
        try:
            user = Account.objects.get(account_username=username)
            sponsor = Sponsor.objects.get(sponsor_name=sponsor_name)
            application = Application.objects.filter(account_username=user, sponsor=sponsor).order_by('-application_at').first()
            if not application:
                return JsonResponse({"error": "Application not found for this sponsor."}, status=404)
            application.application_status = "canceled"
            application.save()
            return JsonResponse({"message": "Application canceled successfully."}, status=200)
        except Account.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except Sponsor.DoesNotExist:
            return JsonResponse({"error": "Sponsor not found"}, status=404)
    return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt
def get_sponsor_details_by_account(request):
    if request.method == "GET":
        try:
            account_username = request.GET.get("username")
            account = Account.objects.get(account_username=account_username)
            sponsoruser = SponsorUser.objects.get(account=account)
            sponsor = Sponsor.objects.get(sponsor_id=sponsoruser.sponsor.sponsor_id)
            data = {
                "sponsor_id": sponsor.sponsor_id,
                "sponsor_name": sponsor.sponsor_name,
                "sponsor_rules": sponsor.sponsor_rules,
                "sponsor_pt_amt": str(sponsor.sponsor_pt_amt),
            }
            return JsonResponse(data)
        except Account.DoesNotExist:
            return JsonResponse({"error": "Account not found"}, status=404)
        except Sponsor.DoesNotExist:
            return JsonResponse({"error": "Sponsor not found"}, status=404)
        except SponsorUser.DoesNotExist:
            return JsonResponse({"error": "SponsorUser not found for this account"}, status=404)
    return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt
def update_sponsor_rules(request):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            rules = data.get("rules", "").strip()
            if not username:
                return JsonResponse({"error": "Username is required."}, status=400)
            if not rules:
                return JsonResponse({"error": "Rules are required."}, status=400)
            account = Account.objects.get(account_username=username)
            sponsor_user = SponsorUser.objects.get(account=account)
            sponsor = Sponsor.objects.get(sponsor_id=sponsor_user.sponsor.sponsor_id)
            sponsor.sponsor_rules = rules
            sponsor.save()
            return JsonResponse({"message": "Rules updated successfully."}, status=200)
        except Account.DoesNotExist:
            return JsonResponse({"error": "Account not found."}, status=404)
        except SponsorUser.DoesNotExist:
            return JsonResponse({"error": "Sponsor association not found."}, status=404)
        except Sponsor.DoesNotExist:
            return JsonResponse({"error": "Sponsor not found."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def get_driver_sponsors(request):
    if request.method == "GET":
        username = request.GET.get("username")
        try:
            account = Account.objects.get(account_username=username)
            driver_sponsors = DriverSponsor.objects.filter(account=account).select_related("sponsor")
            data = []
            for ds in driver_sponsors:
                sponsor = ds.sponsor
                data.append({
                    "sponsor_id": sponsor.sponsor_id,
                    "sponsor_name": sponsor.sponsor_name,
                    "sponsor_rules": sponsor.sponsor_rules,
                    "sponsor_pt_amt": str(sponsor.sponsor_pt_amt),
                    "joined_at": ds.driver_sponsor_joined_at.strftime("%Y-%m-%d %H:%M:%S"),
                })
            return JsonResponse(data, safe=False)
        except Account.DoesNotExist:
            return JsonResponse({"error": "Account not found"}, status=404)
    return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt
def sponsor_catalog_add(request):
    try:
        data = json.loads(request.body)
        username = data.get("username")
        account = Account.objects.get(account_username=username)
        sponsor_user = SponsorUser.objects.get(account=account)
        sponsor = Sponsor.objects.get(sponsor_id=sponsor_user.sponsor.sponsor_id)
        item_name = data.get("name")
        item_creator = data.get("creator")
        item_type = data.get("type")
        item_price = data.get("price")
        item_availability = data.get("availability")
        item_image_url = data.get("image_url")
        if not all([item_name, item_creator, item_price, item_availability, item_image_url]):
            return JsonResponse({"error": "All fields are required."}, status=400)
        catalog_item, created = CatalogItem.objects.get_or_create(
            catalog_item_name=item_name,
            catalog_item_creator=item_creator,
            catalog_item_type=item_type,
            catalog_item_price=item_price,
            catalog_item_availability=item_availability,
            catalog_item_image_url=item_image_url
        )
        existing_link = SponsorCatalogItem.objects.filter(
            sponsor_id=sponsor.sponsor_id,
            catalog_item_id=catalog_item.catalog_item_id
        ).first()
        if existing_link:
            return JsonResponse({"message": "Item already exists in sponsor's catalog."}, status=200)
        SponsorCatalogItem.objects.create(
            sponsor=sponsor,
            catalog_item=catalog_item
        )
        return JsonResponse({"message": "Item successfully added to sponsor catalog."}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@csrf_exempt
def get_sponsor_catalog_items(request, sponsor_id):
    if request.method == "GET":
        token = request.headers.get('Authorization')
        if not token:
            return JsonResponse({"error": "Authentication required"}, status=401)
        try:
            sponsor_items = SponsorCatalogItem.objects.filter(sponsor__sponsor_id=sponsor_id)
            items = []
            for item in sponsor_items:
                catalog = item.catalog_item
                items.append({
                    "item_id": catalog.catalog_item_id,
                    "name": catalog.catalog_item_name,
                    "creator": catalog.catalog_item_creator,
                    "type": catalog.catalog_item_type,
                    "price": str(catalog.catalog_item_price),
                    "availability": "available" if catalog.catalog_item_availability else "unavailable",
                    "image": catalog.catalog_item_image_url,
                })
            return JsonResponse({"items": items}, safe=False)
        except SponsorCatalogItem.DoesNotExist:
            return JsonResponse({"error": "Sponsor not found."}, status=404)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def add_to_cart(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            account_username = data.get("account_username")
            sponsor_id = data.get("sponsor_id")
            catalog_item_id = data.get("catalog_item_id")
            cart_item_quantity = data.get("cart_item_quantity", 1)
            if not all([account_username, sponsor_id, catalog_item_id]):
                return JsonResponse({"error": "Missing required fields."}, status=400)
            try:
                account = Account.objects.get(account_username=account_username)
            except Account.DoesNotExist:
                return JsonResponse({"error": "Account not found."}, status=404)
            try:
                catalog_item = CatalogItem.objects.get(catalog_item_id=catalog_item_id)
            except CatalogItem.DoesNotExist:
                return JsonResponse({"error": "Catalog item not found."}, status=404)
            existing_cart_item = CartItem.objects.filter(
                account=account,
                sponsor_id=sponsor_id,
                catalog_item=catalog_item
            ).first()
            if existing_cart_item:
                existing_cart_item.cart_item_quantity += cart_item_quantity
                existing_cart_item.save()
                return JsonResponse({"message": "Cart item quantity updated."}, status=200)
            else:
                cart_item = CartItem.objects.create(
                    account=account,
                    sponsor_id=sponsor_id,
                    catalog_item=catalog_item,
                    cart_item_quantity=cart_item_quantity
                )
                return JsonResponse({"message": "Item added to cart."}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON."}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def get_cart_items(request, username):
    if request.method == "GET":
        try:
            sponsor_id = request.GET.get("sponsor_id")
            cart_items = CartItem.objects.filter(account__account_username=username)
            items = []
            if sponsor_id:
                cart_items = cart_items.filter(sponsor=sponsor_id)
            for item in cart_items:
                catalog = item.catalog_item
                items.append({
                    "cart_item_id": item.cart_item_id,
                    "name": catalog.catalog_item_name,
                    "creator": catalog.catalog_item_creator,
                    "type": catalog.catalog_item_type,
                    "price": str(catalog.catalog_item_price),
                    "availability": "available" if catalog.catalog_item_availability else "unavailable",
                    "image": catalog.catalog_item_image_url,
                    "quantity": item.cart_item_quantity
                })
            return JsonResponse({"cart": items})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def remove_cart_item(request, item_id):
    if request.method == "DELETE":
        try:
            item = CartItem.objects.get(cart_item_id=item_id)
            item.delete()
            return JsonResponse({"message": "Item removed from cart."})
        except CartItem.DoesNotExist:
            return JsonResponse({"error": "Item not found."}, status=404)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def increase_cart_quantity(request, item_id):
    if request.method == "PATCH":
        try:
            item = CartItem.objects.get(cart_item_id=item_id)
            item.cart_item_quantity += 1
            item.save()
            updated_item = {
                "cart_item_id": item.cart_item_id,
                "name": item.catalog_item.catalog_item_name,
                "creator": item.catalog_item.catalog_item_creator,
                "type": item.catalog_item.catalog_item_type,
                "price": str(item.catalog_item.catalog_item_price),
                "availability": "available" if item.catalog_item.catalog_item_availability else "unavailable",
                "image": item.catalog_item.catalog_item_image_url,
                "quantity": item.cart_item_quantity
            }
            return JsonResponse(updated_item)
        except CartItem.DoesNotExist:
            return JsonResponse({"error": "Item not found."}, status=404)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def decrease_cart_quantity(request, item_id):
    if request.method == "PATCH":
        try:
            item = CartItem.objects.get(cart_item_id=item_id)
            if item.cart_item_quantity > 1:
                item.cart_item_quantity -= 1
                item.save()
                updated_item = {
                "cart_item_id": item.cart_item_id,
                "name": item.catalog_item.catalog_item_name,
                "creator": item.catalog_item.catalog_item_creator,
                "type": item.catalog_item.catalog_item_type,
                "price": str(item.catalog_item.catalog_item_price),
                "availability": "available" if item.catalog_item.catalog_item_availability else "unavailable",
                "image": item.catalog_item.catalog_item_image_url,
                "quantity": item.cart_item_quantity
            }
            else:
                updated_item = {
                "cart_item_id": item.cart_item_id,
                "name": item.catalog_item.catalog_item_name,
                "creator": item.catalog_item.catalog_item_creator,
                "type": item.catalog_item.catalog_item_type,
                "price": str(item.catalog_item.catalog_item_price),
                "availability": "available" if item.catalog_item.catalog_item_availability else "unavailable",
                "image": item.catalog_item.catalog_item_image_url,
                "quantity": item.cart_item_quantity
                }
                return JsonResponse(updated_item)
            return JsonResponse(updated_item)
        except CartItem.DoesNotExist:
            return JsonResponse({"error": "Item not found."}, status=404)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def complete_purchase(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            sponsor_id = data.get('sponsor_id')
            name = data.get('name')
            address = data.get('address')
            account = Account.objects.get(account_username=username)
            if not username or not sponsor_id or not name or not address:
                return JsonResponse({'error': 'Missing required fields'}, status=400)
            purchase_group_id = str(uuid4())
            cart_items = data.get('cart', [])
            if not cart_items:
                return JsonResponse({'error': 'No items in cart'}, status=400)
            total_purchase_amount = 0
            for item in cart_items:
                cart_item_id = item.get('cart_item_id')
                cart_item = CartItem.objects.get(cart_item_id=cart_item_id)
                catalog_item = CatalogItem.objects.get(catalog_item_id=cart_item.catalog_item_id)
                purchase_quantity = int(item.get('quantity', 1))
                purchase_price = float(item.get('price'))
                purchase = Purchase(
                    purchase_group_id=purchase_group_id,
                    sponsor_id=sponsor_id,
                    catalog_item_id=catalog_item.catalog_item_id,
                    account_id=account.account_id,
                    purchase_quantity=purchase_quantity,
                    purchase_price=purchase_price
                )
                purchase.save()
                total_purchase_amount += purchase_price * purchase_quantity
            purchase_summary = PurchaseSummary(
                purchase_group_id=purchase_group_id,
                account_id=account.account_id,
                sponsor_id=sponsor_id,
                purchase_summary_total=total_purchase_amount,
                purchase_summary_name=name,
                address=address
            )
            purchase_summary.save()
            return JsonResponse({'message': 'Purchase completed successfully'}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid HTTP method'}, status=405)
