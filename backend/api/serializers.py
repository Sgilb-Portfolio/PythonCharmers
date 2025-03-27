from rest_framework import serializers
from .models import Account, EbayCredentials, EbayItem, EbayOrder, EbayOrderItem
from django.contrib.auth.hashers import make_password

class PasswordUpdateSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        if len(value) > 0:
            raise serializers.ValidationError("Password must be greater than 0 characters long")
        return value
    
class EbayCredentialsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EbayCredentials
        fields = ['id', 'client_id', 'client_secret', 'refresh_token', 'sandbox', 'created_at']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'client_secret': {'write_only': True},
            'refresh_token': {'write_only': True}
        }

class EbayItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = EbayItem
        fields = [
            'id', 'item_id', 'title', 'description', 'price', 'currency',
            'url', 'image_url', 'quantity', 'ebay_listing_status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class EbayOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = EbayOrderItem
        fields = ['id', 'item_id', 'title', 'quantity', 'price', 'created_at']
        read_only_fields = ['id', 'created_at']

class EbayOrderSerializer(serializers.ModelSerializer):
    items = EbayOrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = EbayOrder
        fields = [
            'id', 'order_id', 'buyer_username', 'buyer_email',
            'total_amount', 'currency', 'status', 'shipping_address',
            'tracking_number', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

# Serializer for search results from eBay API
class EbaySearchResultSerializer(serializers.Serializer):
    item_id = serializers.CharField()
    title = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField()
    url = serializers.URLField()
    image_url = serializers.URLField(required=False, allow_null=True)
    condition = serializers.CharField(required=False, allow_null=True)
    
    def create(self, validated_data):
        # Convert search result to EbayItem
        user = self.context.get('request').user
        
        # Check if item already exists
        try:
            item = EbayItem.objects.get(item_id=validated_data['item_id'])
            # Update existing item
            for key, value in validated_data.items():
                setattr(item, key, value)
            item.save()
        except EbayItem.DoesNotExist:
            # Create new item
            item = EbayItem.objects.create(
                user=user,
                **validated_data
            )
        
        return item