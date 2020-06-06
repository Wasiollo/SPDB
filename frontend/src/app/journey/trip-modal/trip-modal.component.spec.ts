import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripModalComponent } from './trip-modal.component';

describe('TripModalComponent', () => {
  let component: TripModalComponent;
  let fixture: ComponentFixture<TripModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
