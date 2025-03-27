from django.db import models

class PointsValue(models.Model):

  OrgID = models.IntegerField(primary_key=True)
  PointValue = models.IntegerField()

  def __str__(self):
    return str(self.PointValue)