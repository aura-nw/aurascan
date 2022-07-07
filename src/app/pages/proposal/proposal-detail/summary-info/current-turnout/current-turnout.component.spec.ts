import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentTurnoutComponent } from './current-turnout.component';

describe('CurrentTurnoutComponent', () => {
  let component: CurrentTurnoutComponent;
  let fixture: ComponentFixture<CurrentTurnoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrentTurnoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentTurnoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
