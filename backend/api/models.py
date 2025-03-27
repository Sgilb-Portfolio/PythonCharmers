from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

# Create your models here.
class Account(models.Model):
  ACCOUNT_TYPES = [
        ('Admin', 'Admin'),
        ('Sponsor', 'Sponsor'),
        ('Driver', 'Driver'),
    ]
  
  account_id = models.AutoField(primary_key=True)
  account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
  account_username = models.CharField(max_length=150, unique=True)
  account_password = models.CharField(max_length=150)

  def __str__(self):
    return self.account_username
  

User = get_user_model()

class EbayCredentials(models.Model):
    """Stores eBay API credentials for users"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ebay_credentials')
    client_id = models.CharField(max_length=255)
    client_secret = models.CharField(max_length=255)
    refresh_token = models.TextField()
    access_token = models.TextField(blank=True, null=True)
    token_expires_at = models.DateTimeField(blank=True, null=True)
    sandbox = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"eBay credentials for {self.user.username}"
    
    def is_token_valid(self):
        """Check if the access token is still valid"""
        if not self.access_token or not self.token_expires_at:
            return False
        
        # Add a buffer of 5 minutes
        buffer = timezone.timedelta(minutes=5)
        return timezone.now() < (self.token_expires_at - buffer)

class EbayItem(models.Model):
    """Represents items from eBay API"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ebay_items')
    item_id = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    url = models.URLField()
    image_url = models.URLField(blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1)
    ebay_listing_status = models.CharField(max_length=50, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']

class EbayOrder(models.Model):
    """Represents eBay orders"""
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
        ('REFUNDED', 'Refunded'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ebay_orders')
    order_id = models.CharField(max_length=255, unique=True)
    buyer_username = models.CharField(max_length=255)
    buyer_email = models.EmailField(blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    shipping_address = models.TextField(blank=True, null=True)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order #{self.order_id}"
    
    class Meta:
        ordering = ['-created_at']
        
class EbayOrderItem(models.Model):
    """Individual items within an eBay order"""
    order = models.ForeignKey(EbayOrder, on_delete=models.CASCADE, related_name='items')
    item = models.ForeignKey(EbayItem, on_delete=models.SET_NULL, null=True, related_name='order_items')
    item_id = models.CharField(max_length=255)  # Backup if item is deleted
    title = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.quantity}x {self.title}"