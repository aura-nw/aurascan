import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposalVoteComponent } from './proposal-vote.component';

describe('ProposalVoteComponent', () => {
  let component: ProposalVoteComponent;
  let fixture: ComponentFixture<ProposalVoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProposalVoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
