from django.db import models

"""class Sponsor(models.Model):
    FName = models.CharField(max_length=100)
    LName = models.CharField(max_length=100)
    AccountID = models.IntegerField
    OrgID = models.IntegerField

def __str__(self):
 return self.LName"""

class Sponsor(models.Model):
    sponsor_id = models.AutoField(primary_key=True)
    sponsor_name = models.CharField(max_length=255)
    sponsor_rules = models.CharField(max_length=1000)
    sponsor_pt_amt = models.DecimalField(max_digits=6, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'sponsor'