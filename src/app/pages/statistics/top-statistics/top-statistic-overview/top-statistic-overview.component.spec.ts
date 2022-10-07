import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopStatisticOverviewComponent } from './top-statistic-overview.component';

describe('TopStatisticOverviewComponent', () => {
  let component: TopStatisticOverviewComponent;
  let fixture: ComponentFixture<TopStatisticOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopStatisticOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopStatisticOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
