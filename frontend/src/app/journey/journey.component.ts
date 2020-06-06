import {Component, OnInit} from '@angular/core';
import {SearchService} from '../search/search.service';
import {ToastrService} from 'ngx-toastr';
import {JourneyService} from './journey.service';
import {TripModalComponent} from './trip-modal/trip-modal.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-journey',
  templateUrl: './journey.component.html',
  styleUrls: ['./journey.component.css']
})
export class JourneyComponent implements OnInit {

  points = [];

  constructor(private ss: SearchService, private js: JourneyService, private toastr: ToastrService, private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.ss.addedPoint.subscribe(point => {
      if (this.points.some(p => p.location_id === point.location_id)) {
        this.toastr.warning('Wycieczka zawiera już punkt o nazwie: ' + point.location.name);
        return;
      }

      let shortLocationName = point.location.name.substring(0, 23);
      if (point.location.name.length >= 23) {
        shortLocationName += '...';
      }
      point.location.short_name = shortLocationName;
      this.points.push(point);
    });

    this.js.tripPlanning.subscribe(trip => {
      trip.food.forEach(f => {
        this.js.addFoodPoint(f);
      });
    });
  }

  remove(point) {
    this.points = this.points.filter(p => p.location_id !== point.location_id);
    this.toastr.success('Usunięto punkt - ' + point.location.name);
  }

  clearTrip() {
    this.points = [];
    this.js.pointsCleared();
  }

  planTrip() {
    if (this.points.length < 2) {
      this.toastr.warning('Podróż musi mieć przynajmniej dwa punktu');
      return;
    }
    const modalRef = this.modalService.open(TripModalComponent, {size: 'lg'});
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.tripPoints = this.points;
  }

}
