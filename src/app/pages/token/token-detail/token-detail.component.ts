import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  token: string = '';
  loading = true;
  typeTransaction = TYPE_TRANSACTION;
  textSearch: string = '';
  codeTransaction = CodeTransaction;
  tokenName = 'AuraDiamon';
  tokenID = '';
  isNFTContract: boolean;
  //change type of Token
  tokenType = TokenType.Token;

  constructor(private router: ActivatedRoute) {}

  ngOnInit(): void {
    //set temp type token
    this.router.queryParams.subscribe((params) => {
      this.tokenType = params?.tokenType || TokenType.Token;
    });
    this.tokenID = this.router.snapshot.paramMap.get('tokenId');
    if (this.tokenType === TokenType.NFT) {
      this.isNFTContract = true;
    }
  }
  searchTokenTable(): void {}
}
