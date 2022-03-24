import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidatorsVotesComponent } from './validators-votes.component';

describe('ValidatorsVotesComponent', () => {
  let component: ValidatorsVotesComponent;
  let fixture: ComponentFixture<ValidatorsVotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidatorsVotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidatorsVotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
