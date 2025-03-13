from rest_framework import serializers
from .models import Account
from django.contrib.auth.hashers import make_password

class PasswordUpdateSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        if len(value) > 0:
            raise serializers.ValidationError("Password must be greater than 0 characters long")
        return value