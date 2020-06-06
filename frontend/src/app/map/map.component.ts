import {Component, OnInit} from '@angular/core';
import {SearchService} from '../search/search.service';
import {JourneyService} from '../journey/journey.service';
import {ToastrService} from 'ngx-toastr';

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
    google.maps.PolylineOptions = {
    strokeColor: '#0099ff',
    strokeOpacity: 0.8,
    icons: [{icon: {path: google.maps.SymbolPath.FORWARD_OPEN_ARROW}, offset: '50%'}]
  };

  constructor(private ss: SearchService, private js: JourneyService, private toastr: ToastrService) {
  }

  ngOnInit() {
    this.center = {
      lat: 52.2256,
      lng: 21.0030,
    }; // mniej więcej centrum Warszawy :)
    this.ss.addedPoint.subscribe(point => {
      this.points.push(point);
      this.addMarker(point);
    });

    this.js.foodPointAdded.subscribe(foodPoint => {
      this.points.push(foodPoint);
      this.addFoodMarker(foodPoint);
    });

    this.js.tripPlanned.subscribe(trip => {
      if (trip === 'error') {
        this.toastr.error('Wystąpił błąd podczas planowania trasy');
      }
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
      options: {icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png?raw=true'}
    });
  }

  addFoodMarker(foodPoint) {
    this.markers.push({
      position: {
        lat: foodPoint.location.latitude,
        lng: foodPoint.location.longitude,
      },
      label: {
        color: 'red',
        // text: point.location.name,
        text: ' ',
      },
      title: foodPoint.location.name,
      options: {icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png?raw=true'}
    });
  }

}
