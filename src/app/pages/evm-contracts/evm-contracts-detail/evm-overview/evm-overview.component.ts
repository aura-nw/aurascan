import { Component, Input } from '@angular/core';
import { EvmContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
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
    private contractService: ContractService,
    public tokenService: TokenService,
  ) {}
}
