from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection
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
from .models import Account 
from .models import Points
from .cognito_auth import sign_up, sign_in, verify_token, confirm_sign_up
from .cognito_auth import reset_password as cognito_reset_password
from .cognito_auth import forgot_password as cognito_forgot_password
from .cognito_auth import verify_mfa_code as cognito_verify_mfa
import requests;

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
        auth_result = sign_in(data["username"], data["password"])
        if "challenge" in auth_result:
            return JsonResponse(auth_result, status=202)
        if "error" in auth_result:
            return JsonResponse(auth_result, status=401)
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