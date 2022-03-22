import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackingAccountComponent } from './stacking-account.component';

describe('StackingAccountComponent', () => {
  let component: StackingAccountComponent;
  let fixture: ComponentFixture<StackingAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StackingAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StackingAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
