import {EventEmitter, Injectable, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from '../core/api.service';
import {environment} from '../../environments/environment';
import {ApiResponse} from '../core/api.response';

const baseUrl = environment.APIEndpoint;

@Injectable()
export class SearchService {

  @Output() addedPoint: EventEmitter<any> = new EventEmitter();

  constructor(private apiService: ApiService) {
  }

  listPlacesUrl = baseUrl + '/places';

  getPlaces(): Observable<ApiResponse> {
    return this.apiService.get(this.listPlacesUrl);
  }

  addPoint(pointData){
    this.addedPoint.emit(pointData);
  }
}
