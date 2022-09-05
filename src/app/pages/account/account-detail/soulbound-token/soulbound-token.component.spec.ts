import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoulboundTokenComponent } from './soulbound-token.component';

describe('SoulboundTokenComponent', () => {
  let component: SoulboundTokenComponent;
  let fixture: ComponentFixture<SoulboundTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoulboundTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SoulboundTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
