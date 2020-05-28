import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {SearchComponent} from './search/search.component';
import {JourneyComponent} from './journey/journey.component';
import {MapComponent} from './map/map.component';
import {HomeComponent} from './home/home.component';
import {ReactiveFormsModule} from '@angular/forms';
import {GoogleMapsModule} from '@angular/google-maps';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    JourneyComponent,
    MapComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    GoogleMapsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
