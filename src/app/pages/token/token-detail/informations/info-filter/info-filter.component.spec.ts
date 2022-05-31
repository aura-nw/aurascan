import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoFilterComponent } from './info-filter.component';

describe('InfoFilterComponent', () => {
  let component: InfoFilterComponent;
  let fixture: ComponentFixture<InfoFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
