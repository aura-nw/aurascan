import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import BigNumber from 'bignumber.js';
import { EvmContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EModeEvmToken } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-evm-token-overview',
  templateUrl: './evm-token-overview.component.html',
  styleUrls: ['./evm-token-overview.component.scss'],
})
export class EvmTokenOverviewComponent implements OnInit {
  @Input() tokenDetail: any;
  params = '';
  contractType = EvmContractRegisterType;
  EModeEvmToken = EModeEvmToken;

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;

  constructor(
    public tokenService: TokenService,
    private route: ActivatedRoute,
    public environmentService: EnvironmentService,
  ) { }

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
    this.tokenDetail['isHolderUp'] = true;
    this.tokenDetail['tokenValue'] =
      this.tokenDetail.supplyAmount == 0
        ? BigNumber(0)
        : BigNumber(this.tokenDetail.supplyAmount)
          .dividedBy(BigNumber(10).pow(this.tokenDetail.decimal))
          .multipliedBy(this.tokenDetail.price);
  }

  getTotalSupply() {
    this.tokenService.countTotalTokenERC721(this.tokenDetail?.contract_address).subscribe((res) => {
      this.tokenDetail.num_tokens = res.erc721_token_aggregate?.aggregate?.count || this.tokenDetail.num_tokens || 0;
    });
  }

  getHolderNFT() {
    const payload = {
      limit: 100,
      contractAddress: this.tokenDetail?.contract_address,
    };
    this.tokenService.getListTokenHolderErc721(payload).subscribe((res) => {
      this.tokenDetail['holder'] = res.view_count_holder_erc721_aggregate?.aggregate?.count || 0;
    });
  }

  getDataDetail() {
    if (this.tokenDetail.modeToken === EModeEvmToken.ERCToken) {
      if (this.tokenDetail?.type === EvmContractRegisterType.ERC721) {
        this.getTotalSupply();
        this.getHolderNFT();
      }
    }
  }
}
