import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopStatisticsComponent } from './top-statistics.component';

describe('TopStatisticsComponent', () => {
  let component: TopStatisticsComponent;
  let fixture: ComponentFixture<TopStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopStatisticsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
