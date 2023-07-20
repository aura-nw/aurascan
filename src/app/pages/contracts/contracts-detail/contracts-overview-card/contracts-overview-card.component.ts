import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TYPE_ACCOUNT } from 'src/app/core/constants/account.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { Globals } from '../../../../global/global';
import { ContractService } from 'src/app/core/services/contract.service';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';

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
  selectedToken = '$0.00';
  assetsType = TYPE_ACCOUNT;
  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  constructor(
    public global: Globals,
    private environmentService: EnvironmentService,
    private contractService: ContractService,
  ) {}

  ngOnInit() {}

  async ngOnChanges(changes: SimpleChanges) {
    const balanceReq = await this.contractService.getContractBalance(this.contractDetail.address);
    if (balanceReq?.data) {
      this.contractBalance = balanceReq.data.balances[0] ? balanceReq.data.balances[0] : 0;
      this.contractPrice = this.contractBalance * this.priceToken || 0;
    }
  }
}
