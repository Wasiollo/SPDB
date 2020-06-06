from django.db import connection
from rest_framework.response import Response
from rest_framework.views import APIView


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]


class PlacesView(APIView):

    def get(self, request, format=None):

        with connection.cursor() as cursor:
            cursor.execute("SELECT * from locations l WHERE l.location_type = 'trip' ;")
            row = dictfetchall(cursor)

        return Response(row)


class FoodPlacesView(APIView):

    def get(self, request, format=None):

        with connection.cursor() as cursor:
            cursor.execute("SELECT * from locations l WHERE l.location_type = 'food' ;")
            row = dictfetchall(cursor)

        return Response(row)
