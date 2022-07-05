import { Component, Input, OnInit } from '@angular/core';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { TokenType } from 'src/app/core/constants/token.enum';

@Component({
  selector: 'app-token-overview',
  templateUrl: './token-overview.component.html',
  styleUrls: ['./token-overview.component.scss']
})
export class TokenOverviewComponent implements OnInit {
  @Input() tokenType: TokenType;
  tokenTypeConstant = TokenType;
  constructor() { }

  ngOnInit(): void {
  }

}
