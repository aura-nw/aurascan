import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalPriceComponent } from './historical-price.component';

describe('HistoricalPriceComponent', () => {
  let component: HistoricalPriceComponent;
  let fixture: ComponentFixture<HistoricalPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoricalPriceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricalPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
