from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection, transaction
from django.contrib.auth import authenticate
from .models import AboutData
from django.views.decorators.csrf import csrf_exempt   
import jwt
from datetime import datetime, timedelta
from django.utils.timezone import now
from rest_framework_simplejwt.tokens import RefreshToken 
from django.conf import settings  # For SECRET_KEY
from rest_framework import status  # For HTTP status codes
from django.contrib.auth.hashers import make_password
import json                                             
from .models import FailedLoginAttempts, Account
from .cognito_auth import sign_up, sign_in, verify_token, confirm_sign_up

MAX_ATTEMPTS = 3
LOCKOUT_DURATION = timedelta(minutes=1)

def about(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT DATABASE();")
            db_name = cursor.fetchone()
        return JsonResponse({"message": "Connected to DB", "database": db_name[0]})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    


def get_aboutdata(request):
    data = AboutData.objects.first()
    response_data = {
        "teamNum": data.teamnum,
        "versionNum": data.versionnum,
        "releaseDate": data.releasedate,
        "productName": data.productname,
        "productDesc": data.productdesc
    }
    return JsonResponse(response_data)

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
        password = data.get("password")
        try:
            failed_attempt = FailedLoginAttempts.objects.get(username=username)
        except FailedLoginAttempts.DoesNotExist:
            failed_attempt = None
        if failed_attempt and failed_attempt.lockout_until and failed_attempt.lockout_until > now():
            return JsonResponse({
                "error": "Account locked. Try again later.",
                "lockout_until": failed_attempt.lockout_until.strftime("%Y-%m-%d %H:%M:%S")
            }, status=403)
            
        auth_result = sign_in(username, password)
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


# def reset_password(request):
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)  
#             username = data.get("username")
#             new_password = data.get("new_password")
#             confirm_password = data.get("confirm_password")

#             if not username or not new_password or not confirm_password:
#                 return JsonResponse({"error": "All fields are required."}, status=400)

#             if new_password != confirm_password:
#                 return JsonResponse({"error": "Passwords do not match."}, status=400)

#             try:
#                 user = Account.objects.get(username=username)
#                 user.password = make_password(new_password)  # Hash the new password
#                 user.save()
#                 return JsonResponse({"message": "Password updated successfully!"}, status=200)

#             except Account.DoesNotExist:
#                 return JsonResponse({"error": "User not found."}, status=404)

#         except json.JSONDecodeError:
#             return JsonResponse({"error": "Invalid JSON format."}, status=400)

#     return JsonResponse({"error": "Invalid request method."}, status=405)
@csrf_exempt 
def reset_password(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get("username", "").strip()
        new_password = data.get("new_password", "")
        confirm_password = data.get("confirm_password", "")

        if not username or not new_password or not confirm_password:
            return JsonResponse({"error": "All fields are required"}, status=400)

        if new_password != confirm_password:
            return JsonResponse({"error": "Passwords do not match"}, status=400)

        try:
            user = Account.objects.get(account_username=username)
        except Account.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

        # Update the password securely
        user.account_password = new_password
        user.save()

        return JsonResponse({"message": "Password reset successful"}, status=200)

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
