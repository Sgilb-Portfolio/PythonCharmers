from django.db import models


class AboutData(models.Model):
    teamnum = models.IntegerField(db_column='teamNum', blank=True, null=True)  # Field name made lowercase.
    versionnum = models.IntegerField(db_column='versionNum', primary_key=True)  # Field name made lowercase.
    releasedate = models.DateField(db_column='releaseDate', blank=True, null=True)  # Field name made lowercase.
    productname = models.CharField(db_column='productName', max_length=100, blank=True, null=True)  # Field name made lowercase.
    productdesc = models.CharField(db_column='productDesc', max_length=300, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'about_data'