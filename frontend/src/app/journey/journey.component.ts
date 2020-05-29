import { Component, OnInit } from '@angular/core';
import {SearchService} from '../search/search.service';

@Component({
  selector: 'app-journey',
  templateUrl: './journey.component.html',
  styleUrls: ['./journey.component.css']
})
export class JourneyComponent implements OnInit {

  points = [{location: {latitude: 52.2317641, location_id: 1, location_type: "trip", longitude: 21.0057996756161, name: "Pałac Kultury i Nauki"}, location_id: "1", time: { value: 0.5, name: "30 minut" }, timeValue: "0.5"}];
  constructor(private ss: SearchService) { }

  ngOnInit(): void {
    this.ss.addedPoint.subscribe(point => {
      console.log(point);
      this.points.push(point);
    });

  }

}
