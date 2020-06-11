INSERT INTO spdb.locations_distances(start_location_id, end_location_id, car_time, foot_time, bike_time, all_time)
SELECT l1.location_id,
       l2.location_id,
       (SELECT get_travel_time as car_time
        FROM spdb.get_travel_time(l1.longitude::NUMERIC, l1.latitude::NUMERIC, l2.longitude::NUMERIC,
                                  l2.latitude::NUMERIC, 'car')),
       (SELECT get_travel_time as foot_time
        FROM spdb.get_travel_time(l1.longitude::NUMERIC, l1.latitude::NUMERIC, l2.longitude::NUMERIC,
                                  l2.latitude::NUMERIC, 'foot')),
       (SELECT get_travel_time as bike_time
        FROM spdb.get_travel_time(l1.longitude::NUMERIC, l1.latitude::NUMERIC, l2.longitude::NUMERIC,
                                  l2.latitude::NUMERIC, 'bike')),
       (SELECT get_travel_time as all_time
        FROM spdb.get_travel_time(l1.longitude::NUMERIC, l1.latitude::NUMERIC, l2.longitude::NUMERIC,
                                  l2.latitude::NUMERIC, 'all'))
FROM spdb.locations l1
         JOIN spdb.locations l2 ON l1.location_id != l2.location_id;