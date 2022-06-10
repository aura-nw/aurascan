import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenHoldingComponent } from './token-holding.component';

describe('TokenHoldingComponent', () => {
  let component: TokenHoldingComponent;
  let fixture: ComponentFixture<TokenHoldingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenHoldingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenHoldingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
