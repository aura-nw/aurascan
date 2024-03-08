import {Component, Input, OnChanges} from '@angular/core';
import {ContractRegisterType} from "src/app/core/constants/contract.enum";
import {EnvironmentService} from "src/app/core/data-services/environment.service";
import {ContractService} from "src/app/core/services/contract.service";
import {TokenService} from "src/app/core/services/token.service";
import BigNumber from "bignumber.js";
import {filter, take} from "rxjs/operators";

@Component({
  selector: 'app-evm-overview',
  templateUrl: './evm-overview.component.html',
  styleUrls: ['./evm-overview.component.scss']
})
export class EvmOverviewComponent implements OnChanges {
  @Input() contractDetail: any;
  contractBalance;
  contractValue;
  contractRegisterType = ContractRegisterType;
  linkNft = 'token-nft';
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
  ) {
  }

  async ngOnChanges() {
  }
}