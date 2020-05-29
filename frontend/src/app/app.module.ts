import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {SearchComponent} from './search/search.component';
import {JourneyComponent} from './journey/journey.component';
import {MapComponent} from './map/map.component';
import {HomeComponent} from './home/home.component';
import {ReactiveFormsModule} from '@angular/forms';
import {GoogleMapsModule} from '@angular/google-maps';
import {ApiService} from './core/api.service';
import {ToastrModule} from 'ngx-toastr';
import {HttpClientModule} from '@angular/common/http';
import {SearchService} from './search/search.service';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {JourneyService} from './journey/journey.service';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    JourneyComponent,
    MapComponent,
    HomeComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    GoogleMapsModule,
    ToastrModule.forRoot(),
  ],
  providers: [ApiService, SearchService, JourneyService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
