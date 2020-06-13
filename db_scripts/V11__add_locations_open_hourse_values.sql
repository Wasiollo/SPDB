UPDATE
    spdb.locations
    SET start_time = FLOOR(RANDOM()*5) + 6,
    end_time = FLOOR(RANDOM()*4) + 16
WHERE location_type = 'trip';

UPDATE
    spdb.locations
    SET start_time = FLOOR(RANDOM()*4) + 9,
    end_time = FLOOR(RANDOM()*5) + 19
WHERE location_type = 'food';
