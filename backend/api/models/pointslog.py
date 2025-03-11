from django.db import models
from api.models import Driver

class PointsLog(models.Model):

    LogID = models.AutoField(primary_key=True)
    DriverID = models.ForeignKey(Driver, on_delete=models.CASCADE)
    PointsChange = models.IntegerField()
    PointsReason = models.CharField(max_length=255)
    PointsDate = models.DateField()

    def str(self):
        return self.LogID