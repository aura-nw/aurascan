import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryInfoComponent } from './summary-info.component';

describe('SummaryInfoComponent', () => {
  let component: SummaryInfoComponent;
  let fixture: ComponentFixture<SummaryInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummaryInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
