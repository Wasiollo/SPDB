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

  constructor(private apiService: ApiService) {
  }

  journeyPlanned(trip){
    this.tripPlanned.emit(trip);
  }

  pointsCleared(){
    this.clearedPoints.emit(true);
  }
}
