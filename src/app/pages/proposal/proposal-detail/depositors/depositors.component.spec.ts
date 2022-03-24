import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositorsComponent } from './depositors.component';

describe('DepositorsComponent', () => {
  let component: DepositorsComponent;
  let fixture: ComponentFixture<DepositorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepositorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
