import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMobSimpleComponent } from './card-mob-simple.component';

describe('CardMobSimpleComponent', () => {
  let component: CardMobSimpleComponent;
  let fixture: ComponentFixture<CardMobSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardMobSimpleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardMobSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
