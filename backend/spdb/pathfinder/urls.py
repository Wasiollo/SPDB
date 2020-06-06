from django.urls import path
from .views import PlacesView, FoodPlacesView

urlpatterns = [
    path('places/', PlacesView.as_view(), name="places"),
    path('foodPlaces/', FoodPlacesView.as_view(), name="foodPlaces")
]
