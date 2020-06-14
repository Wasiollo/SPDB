import {EventEmitter, Injectable, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from '../core/api.service';
import {environment} from '../../environments/environment';
import {ApiResponse} from '../core/api.response';

const baseUrl = environment.APIEndpoint;

@Injectable()
export class JourneyService {

  @Output() tripPlanned: EventEmitter<any> = new EventEmitter();
  @Output() clearedPoints: EventEmitter<boolean> = new EventEmitter();
  @Output() tripPlanning: EventEmitter<any> = new EventEmitter();
  @Output() foodPointAdded: EventEmitter<any> = new EventEmitter();
  @Output() startTripPointAdded: EventEmitter<any> = new EventEmitter();
  @Output() startPointRemoved: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() foodPointsRemoved: EventEmitter<boolean> = new EventEmitter<boolean>();

  foodPlacesUrl = baseUrl + '/foodPlaces';
  planTripUrl = baseUrl + '/planTrip';
  defaultStartPointUrl = baseUrl + '/startPoint';

  constructor(private apiService: ApiService) {
  }

  journeyPlanned(trip) {
    this.tripPlanned.emit(trip);
  }

  pointsCleared() {
    this.clearedPoints.emit(true);
  }

  getFoodPlaces(): Observable<ApiResponse> {
    return this.apiService.get(this.foodPlacesUrl);
  }

  getDefaultTripPoint(): Observable<ApiResponse> {
    return this.apiService.get(this.defaultStartPointUrl);
  }

  planningTrip(trip) {
    this.removeFoodPoints();
    this.tripPlanning.emit(trip);
    this.apiService.post(this.planTripUrl, trip).subscribe(data => {
      this.journeyPlanned(data.result);
    }, error => {
      this.journeyPlanned('error');
    });
  }

  addStartTripPoint(startTripPoint){
    this.startTripPointAdded.emit(startTripPoint);
  }

  addFoodPoint(location) {
    this.foodPointAdded.emit(location);
  }

  removeStartTripPoint(){
    this.startPointRemoved.emit(true);
  }

  removeFoodPoints(){
    this.foodPointsRemoved.emit(true);
  }
}
