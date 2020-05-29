import {HttpResponse} from '@angular/common/http';

export class ApiResponse {

  status: number;
  message: string;
  result: any;

  constructor(httpResponse: HttpResponse<Object>) {
    this.status = httpResponse.status;
    this.result = httpResponse.body;
    this.message = httpResponse.statusText;
  }
}
