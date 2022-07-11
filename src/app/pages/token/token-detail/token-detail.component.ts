import { Component, OnInit } from '@angular/core';
import { TokenType } from 'src/app/core/constants/token.enum';
import { TYPE_TRANSACTION } from '../../../../app/core/constants/transaction.constant';
import { CodeTransaction } from '../../../../app/core/constants/transaction.enum';

@Component({
  selector: 'app-token-detail',
  templateUrl: './token-detail.component.html',
  styleUrls: ['./token-detail.component.scss'],
})
export class TokenDetailComponent implements OnInit {
  countCurrent: string = '';
  tokenTransferList: any[];
  token: string = '';
  loading = true;
  typeTransaction = TYPE_TRANSACTION;
  textSearch: string = '';
  codeTransaction = CodeTransaction;
  tokenName = 'AuraDiamon';
  isNFTContract = false;

  //change type of Token
  tokenType = TokenType.NFT;

  constructor() {}

  ngOnInit(): void {
    if (this.tokenType === TokenType.NFT) {
      this.isNFTContract = true;
    }
  }

  searchTokenTable(): void {}
}
