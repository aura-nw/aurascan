import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenContractOverviewComponent } from './token-contract-overview.component';

describe('TokenContractOverviewComponent', () => {
  let component: TokenContractOverviewComponent;
  let fixture: ComponentFixture<TokenContractOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenContractOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenContractOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
