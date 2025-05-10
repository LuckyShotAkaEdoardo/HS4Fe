import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalWinLooseComponent } from './modal-win-loose.component';

describe('ModalWinLooseComponent', () => {
  let component: ModalWinLooseComponent;
  let fixture: ComponentFixture<ModalWinLooseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalWinLooseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalWinLooseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
