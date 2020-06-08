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

  sendPlanTrip() {
    const trip = {
      startTimeValue: '7',
      endTimeValue: '22.5',
      food: [
        {
          location_id: '57',
          timeRangeValue: '12.75',
          location: {
            location_id: 57,
            name: 'Zapiecek',
            latitude: 52.2490308582234,
            longitude: 21.0118160056148,
            location_type: 'food'
          }
        },
        {
          location_id: '52',
          timeRangeValue: '14.5',
          location: {
            location_id: 52,
            name: 'El Greco',
            latitude: 52.2362039383592,
            longitude: 20.9990327607283,
            location_type: 'food'
          }
        }
      ],
      tripPoints: [
        {
          location_id: '2',
          timeValue: '0.5',
          location: {
            location_id: 2,
            name: 'Zamek Królewski',
            latitude: 52.24788875,
            longitude: 21.0152806772873,
            location_type: 'trip',
            short_name: 'Zamek Królewski'
          },
          time: {
            value: 0.5,
            name: '30 minut'
          }
        },
        {
          location_id: '1',
          timeValue: '0.25',
          location: {
            location_id: 1,
            name: 'Pałac Kultury i Nauki',
            latitude: 52.2317641,
            longitude: 21.0057996756161,
            location_type: 'trip',
            short_name: 'Pałac Kultury i Nauki'
          },
          time: {
            value: 0.25,
            name: '15 minut'
          }
        },
        {
          location_id: '15',
          timeValue: '0.5',
          location: {
            location_id: 15,
            name: 'Tor wyścigów konnych Służewiec',
            latitude: 52.16204529136,
            longitude: 21.0110608662305,
            location_type: 'trip',
            short_name: 'Tor wyścigów konnych Sł...'
          },
          time: {
            value: 0.5,
            name: '30 minut'
          }
        }
      ]
    };
    this.js.planningTrip(trip);
  }
}
