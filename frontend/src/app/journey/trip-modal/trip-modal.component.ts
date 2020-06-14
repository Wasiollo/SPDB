import {Component, Input, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {JourneyService} from '../journey.service';

@Component({
  selector: 'app-trip-modal',
  templateUrl: './trip-modal.component.html',
  styleUrls: ['./trip-modal.component.css']
})
export class TripModalComponent implements OnInit {

  @Input() modalRef;
  @Input() tripPoints: any[];

  tripForm: FormGroup;
  defaultTime = {name: 'Wybierz czas', value: 0};
  defaultTimeRange = {name: 'Wybierz czas', value: 0};
  defaultFoodLocation = {name: 'Dowolna restauracja', location_id: 0};
  times = [this.defaultTime];
  foodLocations = [this.defaultFoodLocation];
  timeRanges = [this.defaultTimeRange];
  defaultStartPoint: any;
  startPoints = [];
  defaultVehicle = {name: 'Wszystkie (pieszo, rowerem, samochodem)', value: 'all'};
  vehicleList = [
    this.defaultVehicle,
    {name: 'Pieszo', value: 'foot'},
    {name: 'Rowerem', value: 'bike'},
    {name: 'Samochodem', value: 'car'}
  ];

  constructor(private formBuilder: FormBuilder, private js: JourneyService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.times = this.getTimes();
    this.timeRanges = this.getTimeRanges();
    this.getFoodLocations();
    this.getDefaultStartPoint();
    this.buildTripForm();
  }

  buildTripForm() {
    this.tripForm = this.formBuilder.group(
      {
        startTimeValue: [this.defaultTime.value],
        endTimeValue: [this.defaultTime.value],
        vehicle: [this.defaultVehicle.value],
        startPoint: [this.defaultStartPoint],
        food: new FormArray([])
      }
    );
  }

  get tripFood() {
    return this.tripForm.get('food') as FormArray;
  }

  getTimes() {
    const timesArray = [this.defaultTime];
    for (let i = 7; i < 23; ++i) {
      for (let j = 0; j < 4; ++j) {
        const seconds = j === 0 ? '00' : String(j * 15);
        timesArray.push({value: (i + j / 4), name: '' + i + ':' + seconds});
      }
    }
    return timesArray;
  }

  private getTimeRanges() {
    const timesRangeArray = [this.defaultTimeRange];
    for (let i = 12; i < 22; ++i) {
      for (let j = 0; j < 4; ++j) {
        const minutes = j === 0 ? '00' : String(j * 15);
        timesRangeArray.push({value: (i + j / 4), name: '' + i + ':' + minutes + '-' + (i + 1) + ':' + minutes});
      }
    }
    return timesRangeArray;
  }

  addFood() {
    if (this.tripFood.length >= 3) {
      this.toastr.warning('Do podróży można dodać maksymalnie 3 posiłki');
      return;
    }

    const group = new FormGroup({
      location_id: new FormControl(this.defaultFoodLocation.location_id),
      timeRangeValue: new FormControl(this.defaultTimeRange.value)
    });

    this.tripFood.push(group);
  }

  removeFood(i) {
    this.tripFood.removeAt(i);
  }

  private getFoodLocations() {
    this.js.getFoodPlaces().subscribe(data => {
      this.foodLocations = data.result;
      this.foodLocations.unshift(this.defaultFoodLocation);
    }, error => {
      this.toastr.error('Wystąpił błąd podczas pobierania restauracji.');
    });
  }

  private getDefaultStartPoint() {
    this.js.getDefaultTripPoint().subscribe(data => {
      this.defaultStartPoint = data.result[0];
      this.defaultStartPoint.short_name = 'Start';
      if (!this.tripPoints.find(tp => Number(tp.location_id) === 0)) {
        this.startPoints.push(this.defaultStartPoint);
      }
      this.tripPoints.forEach(p => this.startPoints.push(p.location));
    }, error => {
      this.toastr.error('Wystąpił błąd podczas pobierania lokalizacji startowej');
    });
  }

  onSubmit() {
    const tripRequirements = this.tripForm.value;
    if (Number(tripRequirements.startTimeValue) === 0 || Number(tripRequirements.endTimeValue) === 0) {
      this.toastr.warning('Muisz wybrać godzinę początku i końca podróży.');
      return;
    }

    if (Number(tripRequirements.startTimeValue) >= Number(tripRequirements.endTimeValue)) {
      this.toastr.warning('Godzina początku musi być przed godziną końca podróży.');
      return;
    }

    const trip = this.tripForm.value;
    trip.tripPoints = this.tripPoints;
    const startTripPoint = {
      location_id: '0',
      timeValue: '0',
      location: this.defaultStartPoint,
      time: {value: 0, name: ''}
    };
    if (Number(trip.startPoint) === 0) {
      if (Number(trip.tripPoints[0].location_id) !== 0) {
        trip.tripPoints.unshift(startTripPoint);
        this.js.addStartTripPoint(startTripPoint);
      }
    } else {
      if (Number(trip.tripPoints[0].location_id) === 0) {
        trip.tripPoints.shift();
        this.js.removeStartTripPoint();
      }
    }
    for (const f of trip.food) {
      f.timeValue = 0.5;
      if (Number(f.timeRangeValue) === 0) {
        this.toastr.warning('Musisz wybrać czas wszystkich posiłków');
        return;
      }
      if (Number(f.timeRangeValue) + 1 > Number(trip.endTimeValue)) {
        this.toastr.warning('Żaden posiłek nie może skończyć się po zakończeniu podróży');
        return;
      }
      if (Number(f.timeRangeValue) < Number(trip.startTimeValue)) {
        this.toastr.warning('Żaden posiłek nie może rozpocząć się przed rozpoczęciem podróży');
        return;
      }
      f.location = this.foodLocations.find(fl => Number(fl.location_id) === Number(f.location_id));
    }

    const foodTimesArray = [];
    trip.food.forEach(f => foodTimesArray.push(f.timeRangeValue));
    foodTimesArray.sort();
    for (let i = 1; i < foodTimesArray.length; ++i) {
      if (foodTimesArray[i] - 1 < foodTimesArray[i - 1]) {
        this.toastr.warning('Posiłki nie mogą być w tym samym czasie');
        return;
      }
    }

    this.js.planningTrip(trip);
    this.modalRef.dismiss();
  }
}
