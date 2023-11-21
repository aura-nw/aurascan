import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { CoingeckoService } from 'src/app/core/data-services/coingecko.service';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { Globals } from '../../../../global/global';

@Component({
  selector: 'app-contracts-overview-card',
  templateUrl: './contracts-overview-card.component.html',
  styleUrls: ['./contracts-overview-card.component.scss'],
})
export class ContractsOverviewCardComponent implements OnChanges {
  @Input() contractDetail: any;
  contractBalance;
  contractPrice;
  priceToken = 0;
  contractRegisterType = ContractRegisterType;
  linkNft = 'token-nft';
  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  verifiedStatus = '';
  verifiedText = '';

  constructor(
    public global: Globals,
    private environmentService: EnvironmentService,
    private contractService: ContractService,
    private coingecko: CoingeckoService,
  ) {}

  async ngOnChanges(change) {
    if (!this.contractDetail) {
      return;
    }
    const symbol = this.contractDetail?.cw20_contract?.symbol;
    const balanceReq = await this.contractService.getContractBalance(this.contractDetail.address);
    this.contractBalance = balanceReq?.data?.balances[0]?.amount ? balanceReq?.data?.balances[0]?.amount : 0;

    if (symbol) {
      this.coingecko.coinsMarket$.subscribe({
        next: (coins) => {
          if (coins) {
            const coin = coins.find((item) => item.symbol === symbol);
            if (coin) {
              this.priceToken = coin.current_price;
              this.contractPrice = this.contractBalance * this.priceToken || 0;
            }
          }
        },
      });
    }

    // this.tokenService.getTokenMarketData({ contractAddress: this.contractDetail.address }).subscribe((res) => {
    //   if (res?.length > 0) {
    //     this.priceToken = res[0].current_price;
    //     this.contractPrice = this.contractBalance * this.priceToken || 0;
    //     this.verifiedStatus = res[0].verify_status;
    //     this.verifiedText = res[0].verifiedText;
    //   }
    // });
  }
}
