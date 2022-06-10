import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenHodingWalletComponent } from './token-hoding-wallet.component';

describe('TokenHodingWalletComponent', () => {
  let component: TokenHodingWalletComponent;
  let fixture: ComponentFixture<TokenHodingWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenHodingWalletComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenHodingWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
