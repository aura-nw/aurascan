import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractReadTypeComponent } from './contract-read-type.component';

describe('ContractReadTypeComponent', () => {
  let component: ContractReadTypeComponent;
  let fixture: ComponentFixture<ContractReadTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractReadTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractReadTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
