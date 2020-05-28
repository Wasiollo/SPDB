import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  searchForm: FormGroup;
  locations = [];
  times = [];

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      location: [''],
      time: ['']
    });
    this.locations = this.getLocations();
    this.times = this.getTimes();
  }

  getLocations() {
    return [
      { id: '1', name: 'order 1' },
      { id: '2', name: 'order 2' },
      { id: '3', name: 'order 3' },
      { id: '4', name: 'order 4' }
    ];
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
    console.log(this.searchForm.value);
  }

}
