import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {SearchService} from './search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  searchForm: FormGroup;
  locations = [];
  times = [];

  constructor(private fb: FormBuilder, private ss: SearchService) {
  }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      location_id: [],
      timeValue: ['']
    });
    this.getLocations();
    this.times = this.getTimes();
  }

  getLocations() {
    this.ss.getPlaces() .subscribe(data => {
      this.locations = data.result;
    });
  }

  getTimes() {
    return [
      {value: 0.25, name: '15 minut'},
      {value: 0.5, name: '30 minut'},
      {value: 1, name: '1 godzina'},
      {value: 2, name: '2 godziny'}
    ];
  }

  submit() {
    const addPointData = this.searchForm.value;
    addPointData.location = this.locations.find(l => l.location_id === Number(addPointData.location_id));
    addPointData.time = this.times.find(t => t.value === Number(addPointData.timeValue));
    this.ss.addPoint(addPointData);
  }

}
