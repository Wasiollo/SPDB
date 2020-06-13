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

    def __init__(self, s_time, e_time, t_locations, f_locations, t_times):
        self.start_time = s_time
        self.end_time = e_time
        self.food_locations = f_locations
        self.trip_locations = t_locations
        self.location_points = self.prepare_location_data(self.food_locations, self.trip_locations, t_times)
        self.travel_times = t_times

    def prepare_location_data(self, food_locations, trip_locations, t_times):
        locations = []

        for trip_location in trip_locations:
            location = {
                'location_id': trip_location.get('location_id'),
                'start_time': float(trip_location.get('location').get('start_time')) * MULTIPLIER,
                'end_time': float(trip_location.get('location').get('end_time')) * MULTIPLIER,
                'time_value': float(trip_location.get('timeValue')) * MULTIPLIER
            }
            locations.append(location)

        for food_location in food_locations:
            location = {
                'location_id': food_location.get('location_id'),
                'start_time': max(float(food_location.get('timeRangeValue')),
                                  float(food_location.get('location').get('start_time'))) * MULTIPLIER,
                'end_time': min(float(food_location.get('timeRangeValue')) + 1,
                                float(food_location.get('location').get('end_time'))) * MULTIPLIER,
                'time_value': float(food_location.get('timeValue')) * MULTIPLIER
            }
            locations.append(location)

        return locations

    @property
    def create_data_model(self):
        """Stores the data for the problem."""
        data = {}
        data['time_matrix'] = []
        for travel in self.travel_times:
            data['time_matrix'].append(travel.get('items'))

        data['time_windows'] = []

        for location in self.location_points:
            print(location)
            data['time_windows'].append(
                [int(location.get('start_time')), int(location.get('end_time'))]
            )

        data['num_vehicles'] = 1
        data['depot'] = 0
        print(data)
        return data

    def print_solution(self, data, manager, routing, solution):
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
                    manager.IndexToNode(index), solution.Min(time_var) / MULTIPLIER,
                    solution.Max(time_var) / MULTIPLIER)
                result['trip'].append({'point': manager.IndexToNode(index), 'min_time': solution.Min(time_var),
                    'max_time': solution.Max(time_var)})
                index = solution.Value(routing.NextVar(index))
            time_var = time_dimension.CumulVar(index)
            plan_output += '{0} Time({1},{2})\n'.format(manager.IndexToNode(index),
                                                        solution.Min(time_var) / MULTIPLIER,
                                                        solution.Max(time_var) / MULTIPLIER)
            result['trip'].append({'point': manager.IndexToNode(index), 'min_time': solution.Min(time_var),
                                   'max_time': solution.Max(time_var)})
            result['time'] = solution.Min(time_var) - result['trip'][0].get('min_time')
            plan_output += 'Time of the route: {}min\n'.format(
                solution.Min(time_var))
            print(plan_output)
            total_time += solution.Min(time_var)
        print('Total time of all routes: {}min'.format(total_time))
        print(result)
        return result

    def solve(self):
        """Solve the VRP with time windows."""
        # Instantiate the data problem.
        data = self.create_data_model

        # Create the routing index manager.
        manager = pywrapcp.RoutingIndexManager(len(data['time_matrix']),
                                               data['num_vehicles'], data['depot'])

        # Create Routing Model.
        routing = pywrapcp.RoutingModel(manager)

        # Create and register a transit callback.
        def time_callback(from_index, to_index):
            """Returns the travel time between the two nodes."""
            # Convert from routing variable Index to time matrix NodeIndex.
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return data['time_matrix'][from_node][to_node]

        transit_callback_index = routing.RegisterTransitCallback(time_callback)

        # Define cost of each arc.
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # Add Time Windows constraint.
        time = 'Time'
        routing.AddDimension(
            transit_callback_index,
            MULTIPLIER,  # allow waiting time
            9999999,  # maximum time per vehicle
            False,  # Don't force start cumul to zero.
            time)
        time_dimension = routing.GetDimensionOrDie(time)
        # Add time window constraints for each location except depot.
        for location_idx, time_window in enumerate(data['time_windows']):
            if location_idx == 0:
                continue
            index = manager.NodeToIndex(location_idx)
            print(time_window)
            print(time_window[1])
            time_dimension.CumulVar(index).SetRange(int(time_window[0]), int(time_window[1]))
        # Add time window constraints for each vehicle start node.
        for vehicle_id in range(data['num_vehicles']):
            index = routing.Start(vehicle_id)
            time_dimension.CumulVar(index).SetRange(data['time_windows'][0][0],
                                                    data['time_windows'][0][1])

        # Instantiate route start and end times to produce feasible times.
        for i in range(data['num_vehicles']):
            routing.AddVariableMinimizedByFinalizer(
                time_dimension.CumulVar(routing.Start(i)))
            routing.AddVariableMinimizedByFinalizer(
                time_dimension.CumulVar(routing.End(i)))

        # Setting first solution heuristic.
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

        # Solve the problem.
        solution = routing.SolveWithParameters(search_parameters)

        # Print solution on console.
        if solution:
            result = self.print_solution(data, manager, routing, solution)
            result['location_points'] = self.location_points
            return result
