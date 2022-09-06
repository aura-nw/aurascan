import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractsDeployMainnetComponent } from './contracts-deploy-mainnet.component';

describe('ContractsDeployMainnetComponent', () => {
  let component: ContractsDeployMainnetComponent;
  let fixture: ComponentFixture<ContractsDeployMainnetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractsDeployMainnetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractsDeployMainnetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
