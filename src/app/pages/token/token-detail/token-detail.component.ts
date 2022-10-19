import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
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
  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';

  constructor(
    private router: ActivatedRoute,
    private route: Router,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.contractAddress = this.router.snapshot.paramMap.get('contractAddress');
    if (this.contractAddress === 'null') {
      this.route.navigate(['/']);
    }
    this.getTokenDetail();
  }

  getTokenDetail(): void {
    this.loading = true;

    this.tokenService.getTokenCW20Detail(this.contractAddress).subscribe((res: ResponseDto) => {
      this.tokenDetail = res.data;
      if (this.tokenDetail?.type === ContractRegisterType.CW721) {
        this.tokenDetail.isNFTContract = true;
      }
    });
    this.loading = false;
  }

  getLength(result: string) {
    this.tokenDetail['totalTransfer'] = Number(result) || 0;
  }
}
