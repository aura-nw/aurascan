import { Component, Input, OnChanges } from '@angular/core';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import { filter, take } from 'rxjs/operators';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { TokenService } from 'src/app/core/services/token.service';
import { Globals } from '../../../../global/global';

@Component({
  selector: 'app-contracts-overview-card',
  templateUrl: './contracts-overview-card.component.html',
  styleUrls: ['./contracts-overview-card.component.scss'],
})
export class ContractsOverviewCardComponent implements OnChanges {
  @Input() contractDetail: any;
  contractBalance;
  contractValue;
  contractRegisterType = ContractRegisterType;
  linkNft = 'token-nft';
  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  verifiedStatus = '';
  verifiedText = '';

  constructor(
    public global: Globals,
    private environmentService: EnvironmentService,
    private contractService: ContractService,
    private tokenService: TokenService,
  ) {}

  async ngOnChanges() {
    const balanceReq = await this.contractService.getContractBalance(this.contractDetail.address);
    this.contractBalance = balanceReq?.data?.balances[0]?.amount ? balanceReq?.data?.balances[0]?.amount : 0;
    this.contractBalance = 1000000;
    this.contractValue = new BigNumber(this.contractBalance)
      .dividedBy(this.global.price.aura)
      .dividedBy(BigNumber(10).pow(6));
    this.tokenService.tokensMarket$
      .pipe(
        filter((data) => _.isArray(data)),
        take(1),
      )
      .subscribe((res) => {
        if (res?.length > 0) {
          const value = res.find((token) => token.contract_address === this.contractDetail?.address);
          this.verifiedStatus = value?.verify_status;
          this.verifiedText = value?.verifiedText;
        }
      });
  }
}
