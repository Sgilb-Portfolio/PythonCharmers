from django.db import models


class Application(models.Model):
    application_id = models.AutoField(primary_key=True)
    sponsor = models.ForeignKey('Sponsor', models.DO_NOTHING)
    account_username = models.ForeignKey('Account', models.DO_NOTHING, db_column='account_username', to_field='account_username', blank=True, null=True)
    application_status = models.CharField(max_length=255)
    application_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'application'