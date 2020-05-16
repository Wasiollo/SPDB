from django.db import models

# Auto generate this models from existing database
# Only put them here for reference
# I don't think they can be managed by django ORM
# We can investigate GeoDjango it seems to have some support for postgis


# class Hh2Po4Pgr(models.Model):
#     id = models.IntegerField(primary_key=True)
#     osm_id = models.BigIntegerField(blank=True, null=True)
#     osm_name = models.CharField(max_length=-1, blank=True, null=True)
#     osm_meta = models.CharField(max_length=-1, blank=True, null=True)
#     osm_source_id = models.BigIntegerField(blank=True, null=True)
#     osm_target_id = models.BigIntegerField(blank=True, null=True)
#     clazz = models.IntegerField(blank=True, null=True)
#     flags = models.IntegerField(blank=True, null=True)
#     source = models.IntegerField(blank=True, null=True)
#     target = models.IntegerField(blank=True, null=True)
#     km = models.FloatField(blank=True, null=True)
#     kmh = models.IntegerField(blank=True, null=True)
#     cost = models.FloatField(blank=True, null=True)
#     reverse_cost = models.FloatField(blank=True, null=True)
#     x1 = models.FloatField(blank=True, null=True)
#     y1 = models.FloatField(blank=True, null=True)
#     x2 = models.FloatField(blank=True, null=True)
#     y2 = models.FloatField(blank=True, null=True)
#     geom_way = models.TextField(blank=True, null=True)  # This field type is a guess.

#     class Meta:
#         managed = False
#         db_table = 'hh_2po_4pgr'


# class Locations(models.Model):
#     location_id = models.AutoField(primary_key=True)
#     name = models.CharField(max_length=255, blank=True, null=True)
#     latitude = models.FloatField(blank=True, null=True)
#     longitude = models.FloatField(blank=True, null=True)
#     location_type = models.TextField(blank=True, null=True)  # This field type is a guess.

#     class Meta:
#         managed = False
#         db_table = 'locations'


# class SpatialRefSys(models.Model):
#     srid = models.IntegerField(primary_key=True)
#     auth_name = models.CharField(max_length=256, blank=True, null=True)
#     auth_srid = models.IntegerField(blank=True, null=True)
#     srtext = models.CharField(max_length=2048, blank=True, null=True)
#     proj4text = models.CharField(max_length=2048, blank=True, null=True)

#     class Meta:
#         managed = False
#         db_table = 'spatial_ref_sys'
