import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ApiResponse} from './api.response';

@Injectable()
export class ApiService {

  jsonFormat = '/?format=json';

  constructor(private http: HttpClient) {
  }

  post(postUrl, postData): Observable<ApiResponse> {
    return this.http.post(postUrl + this.jsonFormat, postData, {observe: 'response'}).pipe(map(res => new ApiResponse(res)));
  }

  get(getUrl): Observable<ApiResponse> {
    return this.http.get(getUrl + this.jsonFormat, {observe: 'response'}).pipe(map(res => new ApiResponse(res)));
  }

  put(putUrl, putData): Observable<ApiResponse> {
    return this.http.put(putUrl + this.jsonFormat, putData, {observe: 'response'}).pipe(map(res => new ApiResponse(res)));
  }

  delete(deleteUrl): Observable<ApiResponse> {
    return this.http.delete(deleteUrl + this.jsonFormat, {observe: 'response'}).pipe(map(res => new ApiResponse(res)));
  }

}
