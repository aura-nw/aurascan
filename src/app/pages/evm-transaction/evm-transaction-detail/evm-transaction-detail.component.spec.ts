import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvmTransactionDetailComponent } from './evm-transaction-detail.component';

describe('EvmTransactionDetailComponent', () => {
  let component: EvmTransactionDetailComponent;
  let fixture: ComponentFixture<EvmTransactionDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EvmTransactionDetailComponent]
    });
    fixture = TestBed.createComponent(EvmTransactionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
