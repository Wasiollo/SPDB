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
    icons: [{icon: {path: google.maps.SymbolPath.FORWARD_OPEN_ARROW}, offset: '100%', repeat: '30px'}]
  };

  tripTime = '';
  tripStart = '';
  tripEnd = '';

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

    this.js.startTripPointAdded.subscribe(startTripPoint => {
      this.points.push(startTripPoint);
      this.addStartPointMarker(startTripPoint);
    });

    this.js.startPointRemoved.subscribe(removed => {
      if (removed){
        this.points = this.points.filter( p => Number(p.location_id) !== 0);
        this.markers = this.markers.filter(m => Number(m.locationId) !== 0);
      }
    });

    this.js.foodPointsRemoved.subscribe(removed => {
      if (removed) {
        this.markers = this.markers.filter(m => m.type !== 'food');
      }
    });

    this.js.tripPlanned.subscribe(trip => {
      if (trip === 'error') {
        this.toastr.error('Wystąpił błąd podczas planowania trasy');
        return;
      }

      this.tripTime = this.secondsToHMS(trip.route_time);
      this.tripStart = this.secondsToHMS(trip.start_time);
      this.tripEnd = this.secondsToHMS(trip.end_time);
      this.path = trip.route;
    });

    this.js.clearedPoints.subscribe(cleared => {
      this.markers = [];
      this.path = [];
      this.points = [];
    });
  }

  secondsToHMS(seconds) {
    const secNum = parseInt(seconds, 10);
    const h = Math.floor(secNum / 3600);
    const m = Math.floor((secNum / 60) % 60);
    const s = secNum % 60;
    return [h, m, s]
      .map(v => v < 10 ? '0' + v : v)
      .filter((v, i) => v !== '00' || i > 0)
      .join(':');
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
      title: point.location.name + ' - (' + point.location.start_time + ', ' + point.location.end_time + ')',
      // options: {animation: google.maps.Animation.BOUNCE}
      options: {icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png?raw=true'},
      locationId: point.location_id,
      type: 'trip'
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
      title: foodPoint.location.name + ' - (' + foodPoint.location.start_time + ', ' + foodPoint.location.end_time + ')',
      options: {icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png?raw=true'},
      locationId: foodPoint.location_id,
      type: 'food'
    });
  }
  addStartPointMarker(startTripPoint) {
    this.markers.push({
      position: {
        lat: startTripPoint.location.latitude,
        lng: startTripPoint.location.longitude,
      },
      label: {
        color: 'red',
        // text: point.location.name,
        text: ' ',
      },
      title: startTripPoint.location.name + ' - (' + startTripPoint.location.start_time + ', ' + startTripPoint.location.end_time + ')',
      options: {icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png?raw=true'},
      locationId: 0,
      type: 'start'
    });
  }
}
