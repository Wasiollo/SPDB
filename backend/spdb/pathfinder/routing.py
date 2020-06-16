"""Vehicles Routing Problem (VRP) with Time Windows."""

from __future__ import print_function
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

MULTIPLIER = 3600


class VehicleRouting:
    start_time = 0
    end_time = 0
    location_points = []
    food_locations = []
    trip_locations = []
    travel_times = []
    vehicle_num = 1
    depot = 0

    def __init__(self, s_time, e_time, t_locations, f_locations, t_times, depot_num, v_num):
        self.start_time = s_time
        self.end_time = e_time
        self.food_locations = f_locations
        self.trip_locations = t_locations
        self.vehicle_num = v_num
        self.depot = depot_num
        self.location_points = self.prepare_location_data(self.food_locations, self.trip_locations)
        self.travel_times = self.prepare_travel_times(self.location_points, t_times)

    def prepare_travel_times(self, location_points, t_times):
        travel_times = []
        all_points = []

        for trip_point in self.trip_locations:
            all_points.append(trip_point)
        for food in self.food_locations:
            all_points.append(food)

        location_points_ids = []
        for l_p in location_points:
            location_points_ids.append(l_p.get('location_id'))

        filter_result = list(filter(lambda location: location['location_id'] not in location_points_ids, all_points))
        filter_result_ids = []
        for fr in filter_result:
            filter_result_ids.append(fr.get('location_id'))

        idxs_to_remove = []
        for idx, point in enumerate(all_points):
            if point.get('location_id') in filter_result_ids:
                idxs_to_remove.append(idx)

        original_depot = self.depot

        for t in t_times:
            for idx in reversed(idxs_to_remove):
                t.get('items').pop(idx)
        for idx in reversed(idxs_to_remove):
            t_times.pop(idx)
            if idx < original_depot:
                self.depot -= 1
            if idx == original_depot:
                self.depot = 0

        for idx, travel in enumerate(t_times):
            travel_items = travel.get('items')
            time_value = location_points[idx].get('time_value')
            modified_travel_items = [float(x) + time_value for x in travel_items]  # entended with time needed to stay
            travel_times.append(modified_travel_items)
        return travel_times

    def prepare_location_data(self, food_locations, trip_locations):
        locations = []

        for trip_location in trip_locations:
            location_time_value = float(trip_location.get('timeValue')) * MULTIPLIER
            location = {
                'location_id': trip_location.get('location_id'),
                'time_value': location_time_value,
                'start_time': max(float(self.start_time),
                                  float(trip_location.get('location').get('start_time'))) * MULTIPLIER,
                'end_time': min(float(self.end_time),
                                float(trip_location.get('location').get('end_time'))) * MULTIPLIER - location_time_value
            }
            if location.get('end_time') > location.get('start_time'):
                locations.append(location)

        for food_location in food_locations:
            location_time_value = float(food_location.get('timeValue')) * MULTIPLIER
            location = {
                'location_id': food_location.get('location_id'),
                'time_value': location_time_value,
                'start_time': max(float(self.start_time), float(food_location.get('timeRangeValue')),
                                  float(food_location.get('location').get('start_time'))) * MULTIPLIER,
                'end_time': min(float(self.end_time), float(food_location.get('timeRangeValue')) + 1,
                                float(food_location.get('location').get('end_time'))) * MULTIPLIER - location_time_value
            }
            if location.get('end_time') > location.get('start_time'):
                locations.append(location)

        return locations

    @property
    def create_data_model(self):
        """Stores the data for the problem."""
        data = {}
        data['time_matrix'] = []
        for travel in self.travel_times:
            data['time_matrix'].append(travel)

        data['time_windows'] = []

        for location in self.location_points:
            data['time_windows'].append(
                [int(location.get('start_time')), int(location.get('end_time'))]
            )

        data['num_vehicles'] = self.vehicle_num
        data['depot'] = self.depot
        return data

    def prepare_solution(self, data, manager, routing, solution):
        """Prints solution on console."""
        time_dimension = routing.GetDimensionOrDie('Time')
        total_time = 0
        results = []
        for vehicle_id in range(data['num_vehicles']):
            result = {}
            index = routing.Start(vehicle_id)
            result['index'] = index
            result['trip'] = []
            plan_output = 'Route for vehicle {}:\n'.format(vehicle_id)
            while not routing.IsEnd(index):
                time_var = time_dimension.CumulVar(index)
                plan_output += '{0} Time({1},{2}) -> '.format(
                    manager.IndexToNode(index), solution.Min(time_var),
                    solution.Max(time_var))
                result['trip'].append({'point': manager.IndexToNode(index), 'min_time': solution.Min(time_var),
                                       'max_time': solution.Max(time_var)})
                index = solution.Value(routing.NextVar(index))
            time_var = time_dimension.CumulVar(index)
            plan_output += '{0} Time({1},{2})\n'.format(manager.IndexToNode(index),
                                                        solution.Min(time_var),
                                                        solution.Max(time_var))
            result['trip'].append({'point': manager.IndexToNode(index), 'min_time': solution.Min(time_var),
                                   'max_time': solution.Max(time_var)})
            result['time'] = solution.Min(time_var) - result['trip'][0].get('min_time')

            print(plan_output)
            total_time += solution.Min(time_var)
            results.append(result)
        final_result = sorted(results, key=lambda k: len(k['trip']))[-1]

        return final_result

    def solve_problem(self):
        """Solve the VRP with time windows."""
        data = self.create_data_model

        routing_index_manager = pywrapcp.RoutingIndexManager(len(data['time_matrix']),
                                               data['num_vehicles'], data['depot'])

        routing_model = pywrapcp.RoutingModel(routing_index_manager)

        def time_callback(from_index, to_index):
            """Returns the travel time between the two nodes."""
            from_node = routing_index_manager.IndexToNode(from_index)
            to_node = routing_index_manager.IndexToNode(to_index)
            return data['time_matrix'][from_node][to_node]

        transit_callback_index = routing_model.RegisterTransitCallback(time_callback)

        routing_model.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        time_per_vehicle = int(float(self.end_time) * MULTIPLIER)
        time = 'Time'
        routing_model.AddDimension(
            transit_callback_index,
            900,  # 15min
            time_per_vehicle,
            False,
            time)
        time_dimension = routing_model.GetDimensionOrDie(time)

        for location_idx, time_window in enumerate(data['time_windows']):
            if location_idx == self.depot:
                continue
            index = routing_index_manager.NodeToIndex(location_idx)
            time_dimension.CumulVar(index).SetRange(int(time_window[0]), int(time_window[1]))

        for vehicle_id in range(data['num_vehicles']):
            index = routing_model.Start(vehicle_id)
            time_dimension.CumulVar(index).SetRange(data['time_windows'][self.depot][0],
                                                    data['time_windows'][self.depot][1])

        for i in range(data['num_vehicles']):
            routing_model.AddVariableMinimizedByFinalizer(
                time_dimension.CumulVar(routing_model.Start(i)))
            routing_model.AddVariableMinimizedByFinalizer(
                time_dimension.CumulVar(routing_model.End(i)))

        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

        solution = routing_model.SolveWithParameters(search_parameters)

        if solution:
            result = self.prepare_solution(data, routing_index_manager, routing_model, solution)
            result['location_points'] = self.location_points
            return result
