from django.db import models

class DriverSponsor(models.Model):
    driver_sponsor_id = models.AutoField(primary_key=True)
    account = models.ForeignKey('Account', on_delete=models.CASCADE)
    sponsor = models.ForeignKey('Sponsor', on_delete=models.CASCADE)
    driver_sponsor_joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'driver_sponsor'
        unique_together = ('account', 'sponsor')