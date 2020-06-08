-- DROP FUNCTION spdb.get_distance(start_longitude numeric, start_latitude numeric, end_longitude numeric, end_latitude numeric);
CREATE OR REPLACE FUNCTION spdb.get_distance(start_longitude NUMERIC, start_latitude NUMERIC, end_longitude NUMERIC, end_latitude NUMERIC)
RETURNS NUMERIC AS $$
    DECLARE total_cost NUMERIC;
BEGIN
        SELECT MAX(agg_cost) INTO total_cost
        FROM pgr_dijkstra(
                     'SELECT id, source, target, km as cost FROM spdb.hh_2po_4pgr ',
                     (SELECT source
                      FROM spdb.hh_2po_4pgr
                      ORDER BY geom_way <-> ST_GeometryFromText(CONCAT('POINT(', start_longitude::text, ' ', start_latitude::text, ')'), 4326)
                      LIMIT 1),
                     (SELECT target
                      FROM spdb.hh_2po_4pgr
                      ORDER BY geom_way <-> ST_GeometryFromText(CONCAT('POINT(', end_longitude::text, ' ', end_latitude::text, ')'), 4326)
                      LIMIT 1)
                 ) as pt
                 JOIN spdb.hh_2po_4pgr rd ON pt.edge = rd.id;
        RETURN total_cost;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE STRICT ;


-- DROP FUNCTION spdb.get_route_cost(start_longitude NUMERIC, start_latitude NUMERIC, end_longitude NUMERIC, end_latitude NUMERIC);
CREATE OR REPLACE FUNCTION spdb.get_route_cost(start_longitude NUMERIC, start_latitude NUMERIC, end_longitude NUMERIC, end_latitude NUMERIC)
RETURNS NUMERIC AS $$
    DECLARE total_cost NUMERIC;
BEGIN
        SELECT MAX(agg_cost)*3600 INTO total_cost
        FROM pgr_dijkstra(
                     'SELECT id, source, target, km/kmh as cost FROM spdb.hh_2po_4pgr ',
                     (SELECT source
                      FROM spdb.hh_2po_4pgr
                      ORDER BY geom_way <-> ST_GeometryFromText(CONCAT('POINT(', start_longitude::text, ' ', start_latitude::text, ')'), 4326)
                      LIMIT 1),
                     (SELECT target
                      FROM spdb.hh_2po_4pgr
                      ORDER BY geom_way <-> ST_GeometryFromText(CONCAT('POINT(', end_longitude::text, ' ', end_latitude::text, ')'), 4326)
                      LIMIT 1)
                 ) as pt
                 JOIN spdb.hh_2po_4pgr rd ON pt.edge = rd.id;
        RETURN total_cost;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE STRICT ;

-- DROP FUNCTION spdb.get_points_to_route(start_longitude NUMERIC, start_latitude NUMERIC, end_longitude NUMERIC, end_latitude NUMERIC);
CREATE OR REPLACE FUNCTION spdb.get_points_to_route(start_longitude NUMERIC, start_latitude NUMERIC, end_longitude NUMERIC, end_latitude NUMERIC)
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
        RETURN QUERY
        SELECT x1::NUMERIC, y1::NUMERIC, x2::NUMERIC, y2::NUMERIC
        FROM pgr_dijkstra(
                     'SELECT id, source, target, km/kmh as cost FROM spdb.hh_2po_4pgr ',
                     (SELECT source
                      FROM spdb.hh_2po_4pgr
                      ORDER BY geom_way <-> ST_GeometryFromText(CONCAT('POINT(', start_longitude::text, ' ', start_latitude::text, ')'), 4326)
                      LIMIT 1),
                     (SELECT target
                      FROM spdb.hh_2po_4pgr
                      ORDER BY geom_way <-> ST_GeometryFromText(CONCAT('POINT(', end_longitude::text, ' ', end_latitude::text, ')'), 4326)
                      LIMIT 1)
                 ) as pt
                 JOIN spdb.hh_2po_4pgr rd ON pt.edge = rd.id;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE STRICT ;

-- EXAMPLES HOW TO USE; 
-- 
-- SELECT get_distance as distance FROM spdb.get_distance(20.973400, 52.169647, 20.983455, 52.231909);
-- 
-- SELECT get_route_cost as time FROM spdb.get_route_cost(20.973400, 52.169647, 20.983455, 52.231909);
-- 
-- SELECT * FROM spdb.get_points_to_route(20.973400, 52.169647, 20.983455, 52.231909);