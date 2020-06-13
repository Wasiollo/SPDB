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
      "startTimeValue":"7",
      "endTimeValue":"20.5",
      "vehicle":"all",
      "food":[
        {
          "location_id":"38",
          "timeRangeValue":"12.5",
          "timeValue":0.5,
          "location":{
            "location_id":38,
            "name":"Bar Żuczek",
            "latitude":52.2542727895232,
            "longitude":21.0244546789365,
            "location_type":"food",
            "start_time":12,
            "end_time":21
          }
        },
        {
          "location_id":"45",
          "timeRangeValue":"16.75",
          "timeValue":0.5,
          "location":{
            "location_id":45,
            "name":"Bastylia",
            "latitude":52.2193737019842,
            "longitude":21.0173682786144,
            "location_type":"food",
            "start_time":10,
            "end_time":22
          }
        }
      ],
      "tripPoints":[
        {
          "location_id":"10",
          "timeValue":"1",
          "location":{
            "location_id":10,
            "name":"Pole Mokotowskie",
            "latitude":52.2117519253995,
            "longitude":20.9997575445816,
            "location_type":"trip",
            "start_time":10,
            "end_time":17,
            "short_name":"Pole Mokotowskie"
          },
          "time":{
            "value":1,
            "name":"1 godzina"
          }
        },
        {
          "location_id":"1",
          "timeValue":"2",
          "location":{
            "location_id":1,
            "name":"Pałac Kultury i Nauki",
            "latitude":52.225665764,
            "longitude":21.003833318,
            "location_type":"trip",
            "start_time":9,
            "end_time":18,
            "short_name":"Pałac Kultury i Nauki"
          },
          "time":{
            "value":2,
            "name":"2 godziny"
          }
        },
        {
          "location_id":"14",
          "timeValue":"0.5",
          "location":{
            "location_id":14,
            "name":"ZOO Warszawskie",
            "latitude":52.254399,
            "longitude":21.024012,
            "location_type":"trip",
            "start_time":10,
            "end_time":16,
            "short_name":"ZOO Warszawskie"
          },
          "time":{
            "value":0.5,
            "name":"30 minut"
          }
        }
      ]
    };
    this.js.planningTrip(trip);
  }
}
