from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
import numpy as np
import itertools

from .query_creator import create_routing_query
from .routing import VehicleRouting, MULTIPLIER


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
    food_data = sorted(food_data, key=lambda k: k['location_id'])
    trip_points_data = request.data.get('tripPoints')
    trip_points_data = sorted(trip_points_data, key=lambda k: k['location_id'])
    points_data = np.concatenate([food_data, trip_points_data])
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
    routing_result = routing.solve()

    print(routing_result)

    routed_trip = routing_result.get('trip')
    begin_time = routed_trip[0].get('min_time')
    last_time = routed_trip[-1].get('min_time')

    route_time = routing_result.get('time')
    location_points = routing_result.get('location_points')

    routing_points = []
    for point in routed_trip:
        location_id = location_points[point.get('point')].get('location_id')
        filter_result = list(filter(lambda location: location['location_id'] == location_id, points_data))[0]
        routing_points.append(filter_result.get('location'))

    print('Route time: ' + str(route_time / MULTIPLIER))
    print('Route start: ' + str(begin_time / MULTIPLIER))
    print('Route end: ' + str(last_time / MULTIPLIER))
    print(routing_points)

    routing_query = create_routing_query(routing_points, vehicle)
    print(routing_query)
    with connection.cursor() as cursor:
        cursor.execute(routing_query)
        routing_coordinates = fetch_data_as_dict(cursor)

    route = [{'lat': routing_coordinates[0].get('start_y'), 'lng': routing_coordinates[0].get('start_x')}]
    for coordinate in routing_coordinates:
        if coordinate.get('start_y') != route[-1].get('lat') or coordinate.get('start_x') != route[-1].get('lng'):
            route.append({'lat': coordinate.get('start_y'), 'lng': coordinate.get('start_x')})
        route.append({'lat': coordinate.get('end_y'), 'lng': coordinate.get('end_x')})

    print(route)
    response = {'route': route, 'start_time': begin_time, 'route_time': route_time, 'end_time': last_time}
    print(response)

    return Response(response)

