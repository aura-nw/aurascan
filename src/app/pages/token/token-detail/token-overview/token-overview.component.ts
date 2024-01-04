import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EModeToken } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';
import { getBalance } from 'src/app/core/utils/common/parsing';

@Component({
  selector: 'app-token-overview',
  templateUrl: './token-overview.component.html',
  styleUrls: ['./token-overview.component.scss'],
})
export class TokenOverviewComponent implements OnInit {
  @Input() tokenDetail: any;
  params = '';
  contractType = ContractRegisterType;
  EModeToken = EModeToken;

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;

  constructor(
    public tokenService: TokenService,
    private route: ActivatedRoute,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params?.a || '';
    });

    this.getDataDetail();

    //set price change
    this.tokenDetail['change'] = this.tokenDetail['change'] || this.tokenDetail.price_change_percentage_24h;
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
    }

    this.tokenDetail['isHolderUp'] = true;
    if (this.tokenDetail.holderChange < 0) {
      this.tokenDetail['isHolderUp'] = false;
      this.tokenDetail.holderChange = Math.abs(this.tokenDetail.holderChange);
    }

    this.tokenDetail['supplyAmount'] = getBalance(this.tokenDetail.totalSupply, this.tokenDetail.decimals);
    this.tokenDetail['supplyValue'] = new BigNumber(this.tokenDetail['supplyAmount'])
      .multipliedBy(this.tokenDetail?.price || 0)
      .toFixed();
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

  getInfoNative() {
    let nativeToken = this.tokenService.tokensMarket?.find(
      (k) => k.coin_id === this.environmentService.coingecko?.ids[0],
    );

    const supplyAmount = getBalance(this.tokenDetail.totalSupply, this.tokenDetail.decimals);
    const supplyValue = new BigNumber(supplyAmount).multipliedBy(nativeToken?.current_price).toFixed();
    this.tokenDetail = {
      ...this.tokenDetail,
      price: nativeToken?.current_price || this.tokenDetail.price,
      change: nativeToken?.price_change_percentage_24h,
      supplyAmount,
      supplyValue,
    };
  }

  getDataDetail() {
    switch (this.tokenDetail.modeToken) {
      case EModeToken.CWToken:
        if (this.tokenDetail?.type !== ContractRegisterType.CW20) {
          this.getTotalSupply();
          this.getHolderNFT();
        } else {
          this.getTotalHolder();
        }
        break;
      case EModeToken.StakingCoin:
        this.getInfoNative();
        this.getDenomHolder(this.tokenDetail?.denomHash);
        break;
      case EModeToken.IBCCoin:
        this.getDenomHolder(this.tokenDetail?.denomHash);
        break;
    }
  }

  getDenomHolder(paramData){
    this.tokenService.getDenomHolder(paramData).subscribe({
      next: (res) => {
        this.tokenDetail.holder = res?.account_balance_aggregate.aggregate.count;
      },
    });
  }
}
