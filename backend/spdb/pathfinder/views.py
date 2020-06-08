from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
import logging


def fetch_data_as_dict(cursor):
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
            row = fetch_data_as_dict(cursor)

        return Response(row)


class FoodPlacesView(APIView):

    def get(self, request, format=None):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * from locations l WHERE l.location_type = 'food' ;")
            row = fetch_data_as_dict(cursor)

        return Response(row)


@api_view(['POST'])
def plan_trip(request, format=None):
    print("Planning trip")
    print(request.data.get("startTimeValue"))
    with connection.cursor() as cursor:
        cursor.execute("SELECT * from locations l WHERE l.location_type = 'food' ;")
        row = fetch_data_as_dict(cursor)

    return Response(None)

