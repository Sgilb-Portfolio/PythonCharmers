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
import json                                             
from .models import Account                             

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