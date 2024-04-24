import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import _ from 'lodash';
import { filter, take } from 'rxjs';
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
  ) {}

  ngOnInit(): void {
    this.router.params.subscribe((data) => {
      if (data) {
        const { contractAddress } = data;

        this.contractAddress = contractAddress;
        this.getTokenDetail();
        this.getAssetsDetail();
      }
    });
  }

  getAssetsDetail(): void {
    this.tokenService.getTokenDetail(this.contractAddress).subscribe((res) => {
      if (res) {
        const holder =
          res?.tokenHolderStatistics?.length > 0
            ? res?.tokenHolderStatistics?.[res?.tokenHolderStatistics?.length - 1]?.totalHolder
            : 0;
        let changePercent = 0;
        if (
          res.tokenHolderStatistics?.length > 1 &&
          res.tokenHolderStatistics[0]?.totalHolder > 0 &&
          res.tokenHolderStatistics[1]?.totalHolder > 0
        ) {
          changePercent =
            (res.tokenHolderStatistics[1].totalHolder * 100) / res.tokenHolderStatistics[0].totalHolder - 100;
        }

        this.tokenDetail = {
          ...this.tokenDetail,
          holder,
          isHolderUp: changePercent >= 0,
          holderChange: Math.abs(changePercent),
        };
      }
    });
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

        this.tokenService.tokensMarket$
          .pipe(
            filter((data) => _.isArray(data)),
            take(1),
          )
          .subscribe((item) => {
            const tokenMarket = item.find((element) => element.denom === token?.address);

            this.tokenDetail = {
              ...token,
              supplyAmount: token.total_supply,
              modeToken: EModeEvmToken.ERCToken,
              contract_address: this.contractAddress,
              decimals: token.decimal,
              contract_verification: token.evm_smart_contract?.evm_contract_verifications[0]?.status,
              type: EvmContractRegisterType.ERC20,
              price: tokenMarket?.currentPrice || 0,
              priceChangePercentage24h: tokenMarket?.priceChangePercentage24h || 0,
              verify_text: tokenMarket?.verifyText || '',
              verify_status: tokenMarket?.verifyStatus || ''
            };
            this.getAssetsDetail();
          });
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
