import {Component, OnInit} from '@angular/core';
import {JourneyService} from './journey/journey.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  planning = false;

  constructor(private js: JourneyService) {
  }

  ngOnInit(): void {
    this.js.tripPlanned.subscribe(() => this.planning = false);
    this.js.tripPlanning.subscribe(() => this.planning = true);
  }
}
