import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldersComponent } from './holders.component';

describe('HoldersComponent', () => {
  let component: HoldersComponent;
  let fixture: ComponentFixture<HoldersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoldersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HoldersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
