from django.db import models

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


class CognitoLog(models.Model):
    timestamp = models.DateTimeField()
    user_id = models.CharField(max_length=255)
    event_type = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField()
    raw_data = models.JSONField()

    def __str__(self):
        return f"{self.timestamp} - {self.user_id} - {self.event_type}"
