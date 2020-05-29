import {Component, OnInit} from '@angular/core';
import {SearchService} from '../search/search.service';
import {ToastrService} from 'ngx-toastr';
import {JourneyService} from './journey.service';

@Component({
  selector: 'app-journey',
  templateUrl: './journey.component.html',
  styleUrls: ['./journey.component.css']
})
export class JourneyComponent implements OnInit {

  points = [];

  constructor(private ss: SearchService, private js: JourneyService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.ss.addedPoint.subscribe(point => {
      if (this.points.some(p => p.location_id === point.location_id)) {
        this.toastr.warning('Wycieczka zawiera już punkt o nazwie: ' + point.location.name);
        return;
      }

      let shortLocationName = point.location.name.substring(0, 23);
      if (point.location.name.length >= 23) {
        shortLocationName += '...';
      }
      point.location.short_name = shortLocationName;
      this.points.push(point);
    });

  }

  remove(point) {
    this.points = this.points.filter(p => p.location_id !== point.location_id);
    this.toastr.success('Usunięto punkt - ' + point.location.name);
  }

  clearTrip() {
    this.points = [];
    this.js.pointsCleared();
  }

  planTrip() {
    const trip = [];
    this.points.forEach(p => trip.push({longitude: p.location.longitude, latitude: p.location.latitude}));
    this.js.journeyPlanned(trip);
  }

}
