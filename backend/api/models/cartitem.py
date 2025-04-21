from django.db import models

class CartItem(models.Model):
    cart_item_id = models.AutoField(primary_key=True)
    account = models.ForeignKey('Account', on_delete=models.CASCADE)
    sponsor = models.ForeignKey('Sponsor', on_delete=models.CASCADE)
    catalog_item = models.ForeignKey('CatalogItem', on_delete=models.CASCADE)
    cart_item_quantity = models.PositiveIntegerField(default=1)
    cart_item_added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'cart_item'
        unique_together = ('account', 'sponsor', 'catalog_item')
        ordering = ['-cart_item_added_at']