import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackingTabComponent } from './stacking-tab.component';

describe('StackingTabComponent', () => {
  let component: StackingTabComponent;
  let fixture: ComponentFixture<StackingTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StackingTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StackingTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
