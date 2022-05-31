import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenErc20Component } from './token-cw20.component';

describe('TokenErc20Component', () => {
  let component: TokenErc20Component;
  let fixture: ComponentFixture<TokenErc20Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenErc20Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenErc20Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
