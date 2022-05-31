import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenErc721Component } from './token-cw721.component';

describe('TokenErc721Component', () => {
  let component: TokenErc721Component;
  let fixture: ComponentFixture<TokenErc721Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenErc721Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenErc721Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
