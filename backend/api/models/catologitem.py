from django.db import models

class CatalogItem(models.Model):
    catalog_item_id = models.AutoField(primary_key=True)
    catalog_item_name = models.CharField(max_length=255)
    catalog_item_creator = models.CharField(max_length=255)
    catalog_item_type = models.CharField(max_length=100, blank=True, null=True)
    catalog_item_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    catalog_item_availability = models.BooleanField(default=True)
    catalog_item_image_url = models.TextField(blank=True, null=True)
    catalog_item_created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'catalog_item'