from django.db import models

class SponsorCatalogItem(models.Model):
    sponsor_catolog_item_id = models.AutoField(primary_key=True)
    sponsor = models.ForeignKey('Sponsor', on_delete=models.CASCADE)
    catalog_item = models.ForeignKey('CatalogItem', on_delete=models.CASCADE)
    sponsor_catalog_item_added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'sponsor_catalog_item'
        unique_together = ('sponsor', 'catalog_item')