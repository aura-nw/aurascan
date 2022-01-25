import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwostepverificationComponent } from './twostepverification.component';

describe('TwostepverificationComponent', () => {
  let component: TwostepverificationComponent;
  let fixture: ComponentFixture<TwostepverificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwostepverificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwostepverificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
