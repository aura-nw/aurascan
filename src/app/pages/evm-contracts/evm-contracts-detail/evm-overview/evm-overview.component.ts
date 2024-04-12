import { Component, Input } from '@angular/core';
import _ from 'lodash';
import { filter, take } from 'rxjs';
import { EvmContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-evm-overview',
  templateUrl: './evm-overview.component.html',
  styleUrls: ['./evm-overview.component.scss'],
})
export class EvmOverviewComponent {
  @Input() contractDetail: any;

  contractBalance = 0;
  contractValue = 0;
  contractRegisterType = EvmContractRegisterType;

  currencies = this.environmentService.chainInfo.currencies[0];
  denom = this.currencies?.coinDenom;
  coinMinimalDenom = this.currencies?.coinMinimalDenom;
  decimal = this.currencies?.coinDecimals;

  verifiedStatus = '';
  verifiedText = '';
  chainName = this.environmentService.chainName;

  constructor(
    private environmentService: EnvironmentService,
    public tokenService: TokenService,
  ) {}

  ngOnInit(): void {
    this.tokenService.tokensMarket$
      .pipe(
        filter((data) => _.isArray(data)),
        take(1),
      )
      .subscribe((res) => {
        if (res?.length > 0) {
          const value = res.find((token) => token.denom === this.contractDetail?.address);
          this.verifiedStatus = value?.verifyStatus;
          this.verifiedText = value?.verifyText;
        }
      });
  }
}
