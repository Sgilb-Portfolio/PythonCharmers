from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection

def about(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT DATABASE();")
            db_name = cursor.fetchone()
        return JsonResponse({"message": "Connected to DB", "database": db_name[0]})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)