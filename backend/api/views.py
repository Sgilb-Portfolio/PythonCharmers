from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection, transaction
from django.contrib.auth import authenticate
from .models import AboutData
from django.views.decorators.csrf import csrf_exempt   
import jwt
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
from .models import Sponsor
from .models import Application
from .models import SponsorUser
from django.db.models import Max

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

            # Create account with default values
            account = Account.objects.create(
                account_type="Driver",  # Default type
                account_username=username,
                account_password=password  # In production, hash this before saving
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

        # Update password in local database
        user.account_password = new_password
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
    """Returns a list of all drivers with their points"""
    if request.method == "GET":
        drivers = Points.objects.all().values("driver_id", "driver_username", "driver_points")
        return JsonResponse({"drivers": list(drivers)})


@csrf_exempt
def update_points(request):
    """Updates the points for a specific driver"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            points_to_add = data.get("points", 0)

            driver = Points.objects.get(driver_username=username)
            driver.driver_points += points_to_add
            driver.save()

            return JsonResponse({"message": "Points updated successfully", "new_points": driver.driver_points})
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

# Add this to your views.py file

@csrf_exempt
def get_driver_points_by_username(request, username):
    """
    Endpoint to fetch points for a specific driver by username.
    
    Usage: GET /api/get-driver-points/<username>
    """
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)
        
    try:
        driver = Points.objects.get(driver_username=username)
        return JsonResponse({
            "success": True,
            "points": driver.driver_points
        })
    except Points.DoesNotExist:
        return JsonResponse({
            "success": False,
            "error": "Driver not found"
        }, status=404)
    except Exception as e:
        print(f"Error fetching points for driver {username}: {str(e)}")
        return JsonResponse({
            "success": False,
            "error": "Internal server error"
        }, status=500)

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
        try:
            data = json.loads(request.body)
            application_id = data.get("application_id")
            username = data.get("username")
            account = Account.objects.get(account_username=username)
            application = Application.objects.get(application_id=application_id, account_username=account)
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

            # Get account by username
            account = Account.objects.get(account_username=username)

            # Get the sponsor_user entry
            sponsor_user = SponsorUser.objects.get(account=account)

            # Get the sponsor via sponsor_user.sponsor (it's a ForeignKey)
            sponsor = Sponsor.objects.get(sponsor_id=sponsor_user.sponsor.sponsor_id)

            # Update and save the rules
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