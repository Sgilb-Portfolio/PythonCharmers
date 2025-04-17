from django.db import models

class SponsorUser(models.Model):
    account = models.ForeignKey('Account', on_delete=models.CASCADE, db_column='account_id', primary_key=True)
    sponsor = models.ForeignKey('Sponsor', on_delete=models.CASCADE, db_column='sponsor_id')

    class Meta:
        managed = False
        db_table = 'sponsor_user'
        unique_together = (('account', 'sponsor'),)