import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SearchService} from './search.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  searchForm: FormGroup;

  defaultLocation = {name: 'Wybierz lokalizację', location_id: 0};
  locations = [this.defaultLocation];
  defaultTime = {name: 'Wybierz czas', value: 0};
  times = [this.defaultTime];

  constructor(private fb: FormBuilder, private ss: SearchService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      location_id: [this.defaultLocation.location_id],
      timeValue: [this.defaultTime.value]
    });
    this.getLocations();
    this.times = this.getTimes();
  }

  getLocations() {
    this.ss.getPlaces().subscribe(data => {
      this.locations = data.result;
      this.locations.unshift(this.defaultLocation);
    }, error => {
      this.toastr.error('Wystąpił błąd poczas pobierania lokalizacji');
      this.locations.unshift(this.defaultLocation);
    });
  }

  getTimes() {
    return [
      this.defaultTime,
      {value: 0.25, name: '15 minut'},
      {value: 0.5, name: '30 minut'},
      {value: 1, name: '1 godzina'},
      {value: 2, name: '2 godziny'}
    ];
  }

  submit() {
    const addPointData = this.searchForm.value;
    if ( Number(addPointData.location_id) === 0 || Number(addPointData.timeValue) === 0) {
      this.toastr.warning('Musisz wybrać punkt podróży oraz czas w punkcie');
      return;
    }
    addPointData.location = this.locations.find(l => l.location_id === Number(addPointData.location_id));
    addPointData.time = this.times.find(t => t.value === Number(addPointData.timeValue));
    this.ss.addPoint(addPointData);
    this.searchForm.setValue({
      location_id: this.defaultLocation.location_id,
      timeValue: this.defaultTime.value
    });
  }

}
