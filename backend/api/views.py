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
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import EbayCredentials, EbayItem, EbayOrder
from .serializers import (
    EbayCredentialsSerializer, EbayItemSerializer, 
    EbayOrderSerializer, EbaySearchResultSerializer
)
from .ebay_client import get_ebay_client, EbayClient


def about(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT DATABASE();")
            db_name = cursor.fetchone()
        return JsonResponse({"message": "Connected to DB", "database": db_name[0]})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
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

logger = logging.getLogger(__name__)

class EbayCredentialsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing eBay API credentials
    """
    serializer_class = EbayCredentialsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return EbayCredentials.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """
        Verify that the credentials are valid
        """
        credentials = self.get_object()
        
        try:
            client = EbayClient(
                client_id=credentials.client_id,
                client_secret=credentials.client_secret,
                refresh_token=credentials.refresh_token,
                sandbox=credentials.sandbox
            )
            
            # Try to get a token to verify credentials
            token = client.get_access_token()
            
            return Response({
                'valid': True,
                'message': 'Credentials verified successfully'
            })
            
        except Exception as e:
            logger.error(f"eBay credential verification failed: {str(e)}")
            return Response({
                'valid': False,
                'message': f'Failed to verify credentials: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

class EbayItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing eBay items
    """
    serializer_class = EbayItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return EbayItem.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search for items on eBay
        """
        keywords = request.query_params.get('keywords', '')
        limit = int(request.query_params.get('limit', 10))
        category_id = request.query_params.get('category_id', None)
        
        if not keywords:
            return Response({
                'error': 'Keywords parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get eBay client
            try:
                credentials = EbayCredentials.objects.get(user=request.user)
                client = EbayClient(
                    client_id=credentials.client_id,
                    client_secret=credentials.client_secret,
                    refresh_token=credentials.refresh_token,
                    sandbox=credentials.sandbox
                )
            except EbayCredentials.DoesNotExist:
                # Fall back to default client
                client = get_ebay_client()
            
            # Search for items
            result = client.search_items(
                keywords=keywords, 
                limit=limit,
                category_id=category_id
            )
            
            # Transform results to match our serializer
            items = []
            for item in result.get('itemSummaries', []):
                items.append({
                    'item_id': item.get('itemId'),
                    'title': item.get('title'),
                    'price': float(item.get('price', {}).get('value', 0)),
                    'currency': item.get('price', {}).get('currency', 'USD'),
                    'url': item.get('itemWebUrl'),
                    'image_url': item.get('image', {}).get('imageUrl'),
                    'condition': item.get('condition')
                })
            
            serializer = EbaySearchResultSerializer(
                items, 
                many=True,
                context={'request': request}
            )
            
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"eBay search failed: {str(e)}")
            return Response({
                'error': f'Search failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def user_items(self, request):
        """
        Get items listed by the authenticated user on eBay
        """
        limit = int(request.query_params.get('limit', 10))
        offset = int(request.query_params.get('offset', 0))
        
        try:
            # Get eBay client
            try:
                credentials = EbayCredentials.objects.get(user=request.user)
                client = EbayClient(
                    client_id=credentials.client_id,
                    client_secret=credentials.client_secret,
                    refresh_token=credentials.refresh_token,
                    sandbox=credentials.sandbox
                )
            except EbayCredentials.DoesNotExist:
                return Response({
                    'error': 'eBay credentials not found'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user's items
            items = client.get_user_items(limit=limit, offset=offset)
            
            return Response(items)
            
        except Exception as e:
            logger.error(f"Failed to get user eBay items: {str(e)}")
            return Response({
                'error': f'Failed to get items: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def detail(self, request, pk=None):
        """
        Get detailed information about an eBay item
        """
        item = self.get_object()
        
        try:
            # Get eBay client
            try:
                credentials = EbayCredentials.objects.get(user=request.user)
                client = EbayClient(
                    client_id=credentials.client_id,
                    client_secret=credentials.client_secret,
                    refresh_token=credentials.refresh_token,
                    sandbox=credentials.sandbox
                )
            except EbayCredentials.DoesNotExist:
                # Fall back to default client
                client = get_ebay_client()
            
            # Get item details
            result = client.get_item(item.item_id)
            
            return Response(result)
            
        except Exception as e:
            logger.error(f"Failed to get eBay item details: {str(e)}")
            return Response({
                'error': f'Failed to get item details: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EbayOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing eBay orders
    """
    serializer_class = EbayOrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return EbayOrder.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_tracking(self, request, pk=None):
        """
        Update tracking information for an order
        """
        order = self.get_object()
        tracking_number = request.data.get('tracking_number')
        
        if not tracking_number:
            return Response({
                'error': 'Tracking number is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        order.tracking_number = tracking_number
        order.save()
        
        # Here you would also update the tracking info on eBay
        # through their API if needed
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update the status of an order
        """
        order = self.get_object()
        status_value = request.data.get('status')
        
        if not status_value or status_value not in dict(EbayOrder.STATUS_CHOICES):
            return Response({
                'error': 'Valid status is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = status_value
        order.save()
        
        # Here you would also update the status on eBay
        # through their API if needed
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)