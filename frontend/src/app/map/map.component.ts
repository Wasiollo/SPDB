import {Component, OnInit} from '@angular/core';
import {SearchService} from '../search/search.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  markers = [];
  zoom = 12;
  center: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {};

  constructor(private ss: SearchService) {
  }

  ngOnInit() {
    this.center = {
      lat: 52.2256,
      lng: 21.0030,
    }; // mniej więcej centru warszawy
    this.ss.addedPoint.subscribe(point => {
      this.addMarker(point);
    });
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
    console.log(this.markers);
  }

}
