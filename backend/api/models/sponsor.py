from django.db import models

class Sponsor(models.Model):
    FName = models.CharField(max_length=100)
    LName = models.CharField(max_length=100)
    AccountID = models.IntegerField
    OrgID = models.IntegerField

def __str__(self):
 return self.LName