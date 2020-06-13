CREATE INDEX idx_car_2po_4pgr_geom_way ON car_2po_4pgr USING GIST (geom_way);
CREATE INDEX idx_foot_2po_4pgr_geom_way ON foot_2po_4pgr USING GIST (geom_way);
CREATE INDEX idx_bike_2po_4pgr_geom_way ON bike_2po_4pgr USING GIST (geom_way);
CREATE INDEX idx_all_2po_4pgr_geom_way ON all_2po_4pgr USING GIST (geom_way);