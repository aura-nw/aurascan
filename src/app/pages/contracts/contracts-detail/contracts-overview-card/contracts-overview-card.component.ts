import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { TokenService } from 'src/app/core/services/token.service';
import { balanceOf } from 'src/app/core/utils/common/parsing';
import { Globals } from '../../../../global/global';

@Component({
  selector: 'app-contracts-overview-card',
  templateUrl: './contracts-overview-card.component.html',
  styleUrls: ['./contracts-overview-card.component.scss'],
})
export class ContractsOverviewCardComponent implements OnInit, OnChanges {
  @Input() contractDetail: any;
  contractBalance;
  contractPrice;
  priceToken = 0;
  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  constructor(
    public global: Globals,
    private environmentService: EnvironmentService,
    private contractService: ContractService,
    private tokenService: TokenService,
  ) {}

  ngOnInit() {}

  async ngOnChanges(changes: SimpleChanges) {
    const balanceReq = await this.contractService.getContractBalance(this.contractDetail.address);
    this.contractBalance = balanceReq?.data?.balances[0]?.amount ? balanceReq?.data?.balances[0]?.amount : 0;
    this.contractBalance = balanceOf(this.contractBalance);
    this.tokenService.getTokenMarketData({ contractAddress: [this.contractDetail.address] }).subscribe((res) => {
      if (res?.length > 0) {
        this.priceToken = res[0].current_price;
        this.contractPrice = this.contractBalance * this.priceToken || 0;
      }
    });
  }
}
