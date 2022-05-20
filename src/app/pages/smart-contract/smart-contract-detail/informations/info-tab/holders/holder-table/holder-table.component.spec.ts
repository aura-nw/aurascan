import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolderTableComponent } from './holder-table.component';

describe('HolderTableComponent', () => {
  let component: HolderTableComponent;
  let fixture: ComponentFixture<HolderTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HolderTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HolderTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
