def create_routing_query(routing_points, vehicle):
    query = ""
    for i in range(1, len(routing_points) - 1):
        query += "SELECT * FROM spdb.get_points_to_route("
        query += str(routing_points[i - 1].get('longitude'))
        query += ", "
        query += str(routing_points[i - 1].get('latitude'))
        query += ", "
        query += str(routing_points[i].get('longitude'))
        query += ", "
        query += str(routing_points[i].get('latitude'))
        query += ", '"
        query += vehicle
        query += "') UNION ALL "
    query += "SELECT * FROM spdb.get_points_to_route("
    query += str(routing_points[len(routing_points) - 2].get('longitude'))
    query += ", "
    query += str(routing_points[len(routing_points) - 2].get('latitude'))
    query += ", "
    query += str(routing_points[len(routing_points) - 1].get('longitude'))
    query += ", "
    query += str(routing_points[len(routing_points) - 1].get('latitude'))
    query += ", '"
    query += vehicle
    query += "') ;"
    return query
