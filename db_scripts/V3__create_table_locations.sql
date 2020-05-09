create type spdb.location_t as enum('food', 'trip');

CREATE TABLE spdb.locations (
    location_id serial primary key,
    name VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_type location_t
);