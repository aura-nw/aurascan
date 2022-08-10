import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
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
  tokenDetail: any;

  constructor(private router: ActivatedRoute, private tokenService: TokenService) {}

  ngOnInit(): void {
    this.contractAddress = this.router.snapshot.paramMap.get('contractAddress');
    this.getTokenDetail();
  }

  searchTokenTable(): void {}

  getTokenDetail(): void {
    this.loading = true;

    this.tokenService.getTokenCW20Detail(this.contractAddress).subscribe((res: ResponseDto) => {
      this.tokenDetail = res.data;
      if (this.tokenDetail.type === ContractRegisterType.CW721) {
        this.tokenDetail.isNFTContract = true;
      }
    });
    this.loading = false;
  }
}
