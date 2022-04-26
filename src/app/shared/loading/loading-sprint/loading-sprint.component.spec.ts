import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingSprintComponent } from './loading-sprint.component';

describe('LoadingSprintComponent', () => {
  let component: LoadingSprintComponent;
  let fixture: ComponentFixture<LoadingSprintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingSprintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingSprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
