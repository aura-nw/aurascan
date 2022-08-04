import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TokenType } from 'src/app/core/constants/token.enum';
import { ResponseDto } from 'src/app/core/models/common.model';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-token-detail',
  templateUrl: './token-detail.component.html',
  styleUrls: ['./token-detail.component.scss'],
})
export class TokenDetailComponent implements OnInit {
  loading = true;
  contractAddress = '';
  isNFTContract: boolean;
  tokenDetail: any;
  //change type of Token
  tokenType = TokenType.Token;

  constructor(private router: ActivatedRoute, private tokenService: TokenService) {}

  ngOnInit(): void {
    //set temp type token
    this.router.queryParams.subscribe((params) => {
      this.tokenType = params?.tokenType || TokenType.Token;
    });
    this.contractAddress = this.router.snapshot.paramMap.get('contractAddress');
    if (this.tokenType === TokenType.NFT) {
      this.isNFTContract = true;
    }
    this.getTokenDetail();
  }

  searchTokenTable(): void {}

  getTokenDetail(): void {
    this.loading = true;
    if (this.isNFTContract) {
      this.tokenService.getTokenCW721Detail(this.contractAddress).subscribe((res: ResponseDto) => {
        this.tokenDetail = res.data;
      });
    } else {
      this.tokenService.getTokenCW20Detail(this.contractAddress).subscribe((res: ResponseDto) => {
        this.tokenDetail = res.data;
      });
    }

    this.loading = false;
  }
}
