import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractsSmartListComponent } from './contracts-smart-list.component';

describe('ContractsSmartListComponent', () => {
  let component: ContractsSmartListComponent;
  let fixture: ComponentFixture<ContractsSmartListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractsSmartListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractsSmartListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
