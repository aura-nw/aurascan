import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopStatisticTransactionComponent } from './top-statistic-transaction.component';

describe('TopStatisticTransactionComponent', () => {
  let component: TopStatisticTransactionComponent;
  let fixture: ComponentFixture<TopStatisticTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopStatisticTransactionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopStatisticTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
