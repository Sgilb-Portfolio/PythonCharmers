from django.db import models


class Prof(models.Model):
    account_id = models.IntegerField(primary_key=True)
    prof_fname = models.CharField(max_length=255, null=True, blank=True)
    prof_lname = models.CharField(max_length=255, null=True, blank=True)
    prof_ph_number = models.CharField(max_length=255, null=True, blank=True)
    prof_email = models.CharField(max_length=255, null=True, blank=True)
    prof_pic_url = models.CharField(max_length=255, null=True, blank=True)
    prof_updated_at = models.DateTimeField(auto_now=True)
    prof_bio = models.CharField(max_length=500, null=True, blank=True)

    def __str__(self):
        return f"{self.prof_fname} {self.prof_lname}"

    class Meta:
        managed = False
        db_table = 'prof'