from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
import logging
import itertools

from .routing import VehicleRouting


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

# SELECT ld.start_location_id, ld.end_location_id, all_time
# FROM spdb.locations_distances ld
# WHERE ld.start_location_id IN (1, 2, 3, 13, 19, 30)
# AND ld.end_location_id IN (1, 2, 3, 13, 19, 30)
# ORDER BY ld.start_location_id, ld.end_location_id;


@api_view(['POST'])
def plan_trip(request, format=None):
    print("Planning trip")
    start_time = request.data.get("startTimeValue")
    print("Start time: " + start_time)
    end_time = request.data.get("endTimeValue")
    print("End time: " + end_time)
    vehicle = request.data.get("vehicle")
    print("Vehicle: " + vehicle)
    food_data = request.data.get('food')
    trip_points_data = request.data.get('tripPoints')
    print(food_data)
    print(trip_points_data)
    points = []

    for food in food_data:
        points.append(food)
    for trip_point in trip_points_data:
        points.append(trip_point)

    with connection.cursor() as cursor:
        cursor.execute(
            """
                SELECT ld.start_location_id, ld.end_location_id, {0} as route_time
                FROM spdb.locations_distances ld
            
                WHERE ld.start_location_id IN %(locations)s
                AND ld.end_location_id IN %(locations)s
                ORDER BY ld.start_location_id, ld.end_location_id;
            """.format(vehicle + '_time'), {
                    "locations": tuple([point.get('location_id') for point in points])
                }
        )
        trip_times = fetch_data_as_dict(cursor)

    groups = itertools.groupby(trip_times, lambda x: x.get('start_location_id'))

    # TODO remove * 3600
    trip_times_grouped = [{'start_location_id': k, 'items': [x.get('route_time') * 3600 for x in v]} for k, v in groups]
    print(trip_times_grouped)


    routing = VehicleRouting(start_time, end_time, trip_points_data, food_data, trip_times_grouped)
    routing.solve()

    return Response(None)

