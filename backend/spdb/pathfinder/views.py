from django.db import connection
from rest_framework.response import Response
from rest_framework.views import APIView


class PlacesView(APIView):

    def dictfetchall(self, cursor):
        "Return all rows from a cursor as a dict"
        columns = [col[0] for col in cursor.description]
        return [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

    def get(self, request, format=None):

        with connection.cursor() as cursor:
            cursor.execute("SELECT * from locations")
            row = self.dictfetchall(cursor)

        return Response(row)
