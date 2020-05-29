import {Component, OnInit} from '@angular/core';
import {SearchService} from '../search/search.service';
import {JourneyService} from '../journey/journey.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  points = [];
  markers = [];
  zoom = 12;
  center: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {};
  path: google.maps.LatLngLiteral[] =
    [{lat: 25, lng: 26}, {lat: 26, lng: 27}, {lat: 30, lng: 34}];
  polylineOptions:
    google.maps.PolylineOptions = {path: this.path, strokeColor: 'grey', strokeOpacity: 0.8};

  constructor(private ss: SearchService, private js: JourneyService) {
  }

  ngOnInit() {
    this.center = {
      lat: 52.2256,
      lng: 21.0030,
    }; // mniej więcej centru warszawy :)
    this.ss.addedPoint.subscribe(point => {
      this.points.push(point);
      this.addMarker(point);
    });

    this.js.tripPlanned.subscribe(trip => {
      this.path = this.tripToGooglePath(trip);
    });

    this.js.clearedPoints.subscribe(cleared => {
      this.markers = [];
      this.path = [];
      this.points = [];
    });
  }

  tripToGooglePath(trip): google.maps.LatLngLiteral[] {
    const result = [];
    trip.forEach(t => result.push({lat: t.latitude, lng: t.longitude}));

    return result;
  }

  addMarker(point) {
    this.markers.push({
      position: {
        lat: point.location.latitude,
        lng: point.location.longitude,
      },
      label: {
        color: 'red',
        // text: point.location.name,
        text: ' ',
      },
      title: point.location.name,
      // options: {animation: google.maps.Animation.BOUNCE}
      options: {}
    });
  }

}
