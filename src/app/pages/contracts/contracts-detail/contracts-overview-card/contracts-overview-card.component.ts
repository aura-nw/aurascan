import { Component, Input, OnChanges } from '@angular/core';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import { filter, take } from 'rxjs/operators';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { TokenService } from 'src/app/core/services/token.service';

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

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  coinMinimalDenom = this.environmentService.chainInfo.currencies[0].coinMinimalDenom;
  decimal = this.environmentService.chainInfo.currencies[0].coinDecimals;
  verifiedStatus = '';
  verifiedText = '';
  chainName = this.environmentService.chainName;

  constructor(
    private environmentService: EnvironmentService,
    private contractService: ContractService,
    public tokenService: TokenService,
  ) {}

  async ngOnChanges() {
    const nativeBalance = await this.contractService
      .getContractBalance(this.contractDetail.address)
      .then(
        (res) => _.get(res, 'data.balances')?.find((item: { denom: string }) => item.denom == this.coinMinimalDenom),
      );

    this.contractBalance = nativeBalance ? nativeBalance.amount : 0;

    this.contractValue =
      this.contractBalance == 0
        ? 0
        : BigNumber(this.contractBalance)
            .dividedBy(BigNumber(10).pow(this.decimal))
            .multipliedBy(this.tokenService.nativePrice);

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
