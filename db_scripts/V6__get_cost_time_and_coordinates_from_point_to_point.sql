-- Function, which return time travel from one point to the other with vehicle (foot, bike, car, all)
-- DROP FUNCTION spdb.get_travel_time(start_longitude NUMERIC, start_latitude NUMERIC, end_longitude NUMERIC, end_latitude NUMERIC, vehicle VARCHAR);
CREATE OR REPLACE FUNCTION spdb.get_travel_time(start_longitude NUMERIC, start_latitude NUMERIC, end_longitude NUMERIC, end_latitude NUMERIC, vehicle VARCHAR)
RETURNS NUMERIC AS $$
    DECLARE total_cost NUMERIC;
BEGIN
        for total_cost in EXECUTE 'SELECT MAX(agg_cost) as total_cost
        FROM pgr_dijkstra(
                    ''SELECT id, source, target, km/kmh as cost FROM spdb.' || vehicle || '_2po_4pgr '',
                     (SELECT source
                      FROM spdb.' || vehicle || '_2po_4pgr
                      ORDER BY geom_way <-> ST_GeometryFromText(CONCAT(''POINT(' || start_longitude::text || ' ' || start_latitude::text || ')''), 4326)
                      LIMIT 1),
                     (SELECT target
                      FROM spdb.' || vehicle || '_2po_4pgr
                      ORDER BY geom_way <-> ST_GeometryFromText(CONCAT(''POINT(' || end_longitude::text || ' ' || end_latitude::text || ')''), 4326)
                      LIMIT 1)
                 ) as pt
                 JOIN spdb.' || vehicle || '_2po_4pgr rd ON pt.edge = rd.id;' LOOP
                return total_cost;
            end loop;
        RETURN total_cost;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE STRICT ;

-- Function, which return travel points from one point to the other with vehicle (foot, bike, car, all) for route drawing
-- DROP FUNCTION spdb.get_points_to_route(start_longitude NUMERIC, start_latitude NUMERIC, end_longitude NUMERIC, end_latitude NUMERIC, vehicle VARCHAR);
CREATE OR REPLACE FUNCTION spdb.get_points_to_route(start_longitude NUMERIC, start_latitude NUMERIC, end_longitude NUMERIC, end_latitude NUMERIC, vehicle VARCHAR)
    RETURNS TABLE
            (
                start_x NUMERIC,
                start_y NUMERIC,
                end_x NUMERIC,
                end_y NUMERIC
            )
AS
$$
BEGIN
        RETURN QUERY EXECUTE
        'SELECT x1::NUMERIC, y1::NUMERIC, x2::NUMERIC, y2::NUMERIC
        FROM pgr_dijkstra(
                    ''SELECT id, source, target, km/kmh as cost FROM spdb.' || vehicle || '_2po_4pgr '',
                     (SELECT source
                      FROM spdb.' || vehicle || '_2po_4pgr
                      ORDER BY geom_way <-> ST_GeometryFromText(CONCAT(''POINT(' || start_longitude::text || ' ' || start_latitude::text || ')''), 4326)
                      LIMIT 1),
                     (SELECT target
                      FROM spdb.' || vehicle || '_2po_4pgr
                      ORDER BY geom_way <-> ST_GeometryFromText(CONCAT(''POINT(' || end_longitude::text || ' ' || end_latitude::text || ')''), 4326)
                      LIMIT 1)
                 ) as pt
                 JOIN spdb.' || vehicle || '_2po_4pgr rd ON pt.edge = rd.id';
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE STRICT ;

-- Function designed for locations, which return time travel from one location to the other with vehicle (foot, bike, car, all)
-- DROP FUNCTION spdb.get_travel_time_for_locations(start_location INTEGER, end_location integer, vehicle VARCHAR);
CREATE OR REPLACE FUNCTION spdb.get_travel_time_for_locations(start_location INTEGER, end_location integer, vehicle VARCHAR)
RETURNS NUMERIC AS $$
    DECLARE travel_time NUMERIC;
BEGIN
        SELECT (
            SELECT get_travel_time as travel_time
            FROM get_travel_time(
                l1.longitude::NUMERIC,
                l1.latitude::NUMERIC,
                l2.longitude::NUMERIC,
                l2.latitude::NUMERIC,
                vehicle)
            ) into travel_time
        FROM spdb.locations l1
        JOIN spdb.locations l2 ON l1.location_id = start_location AND l2.location_id = end_location;
        RETURN travel_time;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE STRICT ;
