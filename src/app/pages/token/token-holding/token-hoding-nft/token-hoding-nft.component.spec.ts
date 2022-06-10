import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenHodingNftComponent } from './token-hoding-nft.component';

describe('TokenHodingNftComponent', () => {
  let component: TokenHodingNftComponent;
  let fixture: ComponentFixture<TokenHodingNftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenHodingNftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenHodingNftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
