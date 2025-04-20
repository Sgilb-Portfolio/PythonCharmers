from django.db import models

class Purchase(models.Model):
    purchase_id = models.AutoField(primary_key=True)
    purchase_group_id = models.UUIDField()
    sponsor = models.ForeignKey('Sponsor', on_delete=models.CASCADE)
    catalog_item = models.ForeignKey('CatalogItem', on_delete=models.CASCADE)
    account = models.ForeignKey('Account', on_delete=models.CASCADE)
    purchase_quantity = models.PositiveIntegerField(default=1)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'purchase'