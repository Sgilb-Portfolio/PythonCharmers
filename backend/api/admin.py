from django.contrib import admin
from .models import Driver
from .models import Sponsor

# Register your models here.

#@admin.register(Account)
#class AccountAdmin(admin.ModelAdmin):
    #list_display = ('account_id', 'account_username', 'account_type')
    #list_filter = ('account_type',)
    #search_fields = ('account_username',)
    #ordering = ('account_id',) # orders users by account id in asc 

# admin.site.register(Driver)