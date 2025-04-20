from django.db import models

class Points(models.Model):
    points_id = models.AutoField(primary_key=True)
    driver_id = models.IntegerField()
    driver_username = models.CharField(max_length=150)
    driver_points = models.IntegerField(default=0)
    driver_email = models.CharField(max_length=150)
    sponsor = models.ForeignKey('Sponsor', on_delete=models.CASCADE)

    class Meta:
        managed = False
        db_table = 'api_points'
        unique_together = ('driver_id', 'sponsor')
