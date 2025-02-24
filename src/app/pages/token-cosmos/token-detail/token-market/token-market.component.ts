import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EModeToken } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-token-market',
  templateUrl: './token-market.component.html',
  styleUrls: ['./token-market.component.scss'],
})
export class TokenMarketComponent implements OnInit {
  @Input() tokenDetail: any;
  params = '';
  contractType = ContractRegisterType;
  EModeToken = EModeToken;

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;

  constructor(
    public tokenService: TokenService,
    private route: ActivatedRoute,
    public environmentService: EnvironmentService,
  ) {}

  ngOnDestroy(): void {
    this.tokenService.setTotalTransfer(null);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params?.a || '';
    });

    this.getDataDetail();

    //set price change
    this.tokenDetail['change'] = this.tokenDetail['change'] || this.tokenDetail.priceChangePercentage24h;
    this.tokenDetail['isValueUp'] = true;
    if (this.tokenDetail['change'] < 0) {
      this.tokenDetail['isValueUp'] = false;
      this.tokenDetail.change = Number(this.tokenDetail.change.toString().substring(1));
    }

    if (this.tokenDetail.cw20_contract?.cw20_total_holder_stats?.length > 1) {
      this.tokenDetail.holderChange =
        (this.tokenDetail.cw20_contract.cw20_total_holder_stats[1].total_holder * 100) /
          this.tokenDetail.cw20_contract.cw20_total_holder_stats[0].total_holder -
        100;
    } else if (this.tokenDetail.tokenHolderStatistics?.length > 1) {
      this.tokenDetail.holder =
        this.tokenDetail.tokenHolderStatistics[this.tokenDetail.tokenHolderStatistics?.length - 1]?.totalHolder;
      this.tokenDetail.holderChange =
        (this.tokenDetail.cw20_contract.cw20_total_holder_stats[1].total_holder * 100) /
          this.tokenDetail.cw20_contract.cw20_total_holder_stats[0].total_holder -
        100;
    }

    this.tokenDetail['isHolderUp'] = true;
    if (this.tokenDetail.holderChange < 0) {
      this.tokenDetail['isHolderUp'] = false;
      this.tokenDetail.holderChange = Math.abs(this.tokenDetail.holderChange);
    }
  }

  getTotalHolder() {
    this.tokenService.getListTokenHolder(20, 0, this.tokenDetail?.contract_address).subscribe((res) => {
      const data = _.get(res, `cw20_holder_aggregate`);
      this.tokenDetail['holder'] = data?.aggregate?.count || 0;
    });
  }

  getTotalSupply() {
    this.tokenService.countTotalTokenCW721(this.tokenDetail?.contract_address).subscribe((res) => {
      this.tokenDetail.num_tokens = res.cw721_token_aggregate?.aggregate?.count || this.tokenDetail.num_tokens || 0;
    });
  }

  getHolderNFT() {
    const payload = {
      limit: 100,
      contractAddress: this.tokenDetail?.contract_address,
    };
    this.tokenService.getListTokenHolderNFT(payload).subscribe((res) => {
      this.tokenDetail['holder'] = res.view_count_holder_cw721_aggregate?.aggregate?.count || 0;
    });
  }

  getDataDetail() {
    if (this.tokenDetail.modeToken === EModeToken.CWToken) {
      if (this.tokenDetail?.type !== ContractRegisterType.CW20) {
        this.getTotalSupply();
        this.getHolderNFT();
      } else {
        this.getTotalHolder();
      }
    }
  }
}
