import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartContractDetailComponent } from './smart-contract-detail.component';

describe('SmartContractDetailComponent', () => {
  let component: SmartContractDetailComponent;
  let fixture: ComponentFixture<SmartContractDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartContractDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartContractDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
