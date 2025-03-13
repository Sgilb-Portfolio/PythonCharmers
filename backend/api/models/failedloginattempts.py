from django.db import models

class FailedLoginAttempts(models.Model):
    username = models.CharField(primary_key=True, max_length=255)
    failed_attempts = models.IntegerField(blank=True, null=True)
    lockout_until = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'failed_login_attempts'