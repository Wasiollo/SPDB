from rest_framework.views import APIView
from rest_framework.response import Response

from django.db import connection


class PlacesView(APIView):
    def get(self, request, format=None):

        with connection.cursor() as cursor:
            cursor.execute("SELECT * from locations")
            row = cursor.fetchall()

        return Response(row)
