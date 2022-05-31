import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenChartComponent } from './token-chart.component';

describe('TokenChartComponent', () => {
  let component: TokenChartComponent;
  let fixture: ComponentFixture<TokenChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
