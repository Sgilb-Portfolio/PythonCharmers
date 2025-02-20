from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection
from .models import AboutData

def about(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT DATABASE();")
            db_name = cursor.fetchone()
        return JsonResponse({"message": "Connected to DB", "database": db_name[0]})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    


def get_aboutdata(request):
    data = AboutData.objects.first()
    response_data = {
        "teamNum": data.teamnum,
        "versionNum": data.versionnum,
        "releaseDate": data.releasedate,
        "productName": data.productname,
        "productDesc": data.productdesc
    }
    return JsonResponse(response_data)