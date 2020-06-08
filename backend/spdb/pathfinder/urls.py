from django.urls import path

from .views import PlacesView, FoodPlacesView, plan_trip

urlpatterns = [
    path('places/', PlacesView.as_view(), name="places"),
    path('foodPlaces/', FoodPlacesView.as_view(), name="foodPlaces"),
    path('planTrip/', plan_trip, name="planTrip")
]
