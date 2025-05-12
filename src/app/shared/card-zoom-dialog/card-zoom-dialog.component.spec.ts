import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardZoomDialogComponent } from './card-zoom-dialog.component';

describe('CardZoomDialogComponent', () => {
  let component: CardZoomDialogComponent;
  let fixture: ComponentFixture<CardZoomDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardZoomDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardZoomDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
