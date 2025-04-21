import uuid
from django.db import models

class PurchaseSummary(models.Model):
    purchase_group_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    account = models.ForeignKey('Account', on_delete=models.CASCADE)
    sponsor = models.ForeignKey('Sponsor', on_delete=models.CASCADE)
    purchase_summary_total = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_summary_name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    purchase_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'purchase_summary'