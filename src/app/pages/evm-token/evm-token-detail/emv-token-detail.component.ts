import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { ContractRegisterType, EvmContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EModeEvmToken, EModeToken } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-evm-token-detail',
  templateUrl: './evm-token-detail.component.html',
  styleUrls: ['./evm-token-detail.component.scss'],
})
export class EvmTokenDetailComponent implements OnInit {
  loading = true;
  contractAddress = '';
  tokenDetail: any;
  contractType = ContractRegisterType;
  errTxt: string;
  EModeToken = EModeToken;

  chainInfo = this.environmentService.chainInfo;
  excludedAddresses = this.environmentService.chainConfig.excludedAddresses;

  constructor(
    private router: ActivatedRoute,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.contractAddress = this.router.snapshot.paramMap.get('contractAddress');
    // this.location.replaceState(`/token/${this.contractAddress}`, 't=ERC20');

    this.getTokenDetail();
  }

  getTokenDetail(): void {
    const payload = {
      address: this.contractAddress,
    };
    this.tokenService.getEvmTokenDetail(payload).subscribe({
      next: (res) => {
        const token = res.erc20_contract[0];
        if (!token) {
          this.loading = false;
          this.errTxt = 'No Data';
          return;
        }

        this.tokenDetail = {
          ...token,
          supplyAmount: token.total_supply,
          modeToken: EModeEvmToken.ERCToken,
          contract_address: this.contractAddress,
          decimals: token.decimal,
          contract_verification: token.evm_smart_contract?.evm_contract_verifications[0]?.status,
          type: EvmContractRegisterType.ERC20,
          price: 0,
        };
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  getMoreTx(event) {
    this.tokenDetail['hasMoreTx'] = event;
  }
}
