from django.db import models

class Points(models.Model):

  driver_id = models.AutoField(primary_key=True)
  driver_username = models.CharField(max_length=150, unique=True)
  driver_points = models.IntegerField(default=0)
  driver_email = models.CharField(max_length=150)

  def str(self):
    return self.driver_points
