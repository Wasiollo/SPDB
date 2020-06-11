-- DROP TABLE spdb.locations_distances;
CREATE TABLE locations_distances
(
    id                SERIAL PRIMARY KEY,
    start_location_id INTEGER,
    end_location_id   INTEGER,
    car_time          NUMERIC,
    foot_time         NUMERIC,
    bike_time         NUMERIC,
    all_time          NUMERIC
);