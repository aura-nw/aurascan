import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-token-overview',
  templateUrl: './token-overview.component.html',
  styleUrls: ['./token-overview.component.scss'],
})
export class TokenOverviewComponent implements OnInit {
  @Input() tokenDetail: any;
  params = '';
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  constructor(
    public global: Globals,
    private tokenService: TokenService,
    private route: ActivatedRoute,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params?.a || '';
    });
    this.getTotalTransfer();
    this.getTotalHolder();

    //set price change
    this.tokenDetail['change'] = this.tokenDetail.price_change_percentage_24h;
    this.tokenDetail['isValueUp'] = true;
    if (this.tokenDetail['change'] < 0) {
      this.tokenDetail['isValueUp'] = false;
      this.tokenDetail.change = Number(this.tokenDetail.change.toString().substring(1));
    }
  }

  getTotalTransfer() {
    let type = this.tokenDetail?.isNFTContract ? 'cw721-tokens' : 'cw20-tokens';
    this.tokenService.getListTokenTransfer(20, 0, this.tokenDetail?.contract_address, null, type).subscribe((res) => {
      this.tokenDetail['transfers'] = res.meta?.count || 0;
    });
  }

  getTotalHolder() {
    let tokenType = this.tokenDetail?.isNFTContract ? ContractRegisterType.CW721 : ContractRegisterType.CW20;
    this.tokenService.getListTokenHolder(20, 0, tokenType, this.tokenDetail?.contract_address).subscribe((res) => {
      if (res && res.data?.resultAsset?.length > 0) {
        this.tokenDetail['holder'] = res.data?.resultCount || 0;
      }
    });
  }
}
