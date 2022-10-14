import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuBottomBarComponent } from './menu-bottom-bar.component';

describe('MenuBottomBarComponent', () => {
  let component: MenuBottomBarComponent;
  let fixture: ComponentFixture<MenuBottomBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuBottomBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuBottomBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
