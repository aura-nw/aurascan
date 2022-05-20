import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractWriteTypeComponent } from './contract-write-type.component';

describe('ContractWriteTypeComponent', () => {
  let component: ContractWriteTypeComponent;
  let fixture: ComponentFixture<ContractWriteTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractWriteTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractWriteTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
