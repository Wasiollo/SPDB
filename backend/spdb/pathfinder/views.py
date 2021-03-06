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


class StartPointView(APIView):
    def get(self, request, format=None):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * from locations l WHERE l.location_id = 0 ;")
            row = fetch_data_as_dict(cursor)

        return Response(row)


@api_view(['POST'])
def plan_trip(request, format=None):
    print("Planning trip")
    start_time = request.data.get("startTimeValue")
    print("Start time: " + start_time)
    end_time = request.data.get("endTimeValue")
    print("End time: " + end_time)
    vehicle = request.data.get("vehicle")
    print("Vehicle: " + vehicle)
    start_point = request.data.get("startPoint")
    print("Start point: " + start_point)
    food_data = request.data.get('food')
    food_data = sorted(food_data, key=lambda k: k['location_id'])
    trip_points_data = request.data.get('tripPoints')
    trip_points_data = sorted(trip_points_data, key=lambda k: k['location_id'])
    points_data = np.concatenate([food_data, trip_points_data])
    points = []

    for food in food_data:
        points.append(food)
    for trip_point in trip_points_data:
        points.append(trip_point)

    points = sorted(points, key=lambda k: k['location_id'])

    depot = points.index(list(filter(lambda location: location['location_id'] == start_point, points))[0])

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

    trip_times_grouped = [{'start_location_id': k, 'items': [x.get('route_time') * MULTIPLIER for x in v]} for k, v in
                          groups]

    vehicle_num = 0
    routing_result = None
    while routing_result is None:
        vehicle_num += 1
        routing = VehicleRouting(start_time, end_time, trip_points_data, food_data, trip_times_grouped, depot,
                                 vehicle_num)
        routing_result = routing.solve_problem()

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

    routing_query = create_routing_query(routing_points, vehicle)
    with connection.cursor() as cursor:
        cursor.execute(routing_query)
        routing_coordinates = fetch_data_as_dict(cursor)

    route = [{'lat': routing_coordinates[0].get('start_y'), 'lng': routing_coordinates[0].get('start_x')}]
    for coordinate in routing_coordinates:
        if coordinate.get('start_y') != route[-1].get('lat') or coordinate.get('start_x') != route[-1].get('lng'):
            route.append({'lat': coordinate.get('start_y'), 'lng': coordinate.get('start_x')})
        route.append({'lat': coordinate.get('end_y'), 'lng': coordinate.get('end_x')})

    response = {'route': route, 'start_time': begin_time, 'route_time': route_time, 'end_time': last_time}

    return Response(response)
