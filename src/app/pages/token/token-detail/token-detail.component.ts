import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { ETokenCoinTypeBE } from 'src/app/core/constants/token.constant';
import { EModeToken } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { IBCService } from 'src/app/core/services/ibc.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-token-detail',
  templateUrl: './token-detail.component.html',
  styleUrls: ['./token-detail.component.scss'],
})
export class TokenDetailComponent implements OnInit {
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
    private contractService: ContractService,
    private ibcService: IBCService,
  ) {}

  ngOnInit(): void {
    this.contractAddress = this.router.snapshot.paramMap.get('contractAddress');

    if (this.router.snapshot.url[0]?.path !== 'token') {
      this.getTokenDetailNFT();
    } else {
      this.getTokenDetail();
    }
  }

  getTokenDetail(): void {
    let now = new Date();
    now.setDate(now.getDate() - 1);
    this.tokenService.getTokenDetail(this.contractAddress).subscribe({
      next: (token) => {
        let type;
        let modeToken;
        switch (token.type) {
          case ETokenCoinTypeBE.NATIVE:
            modeToken = EModeToken.Native;
            token.symbol = this.chainInfo?.currencies[0].coinDenom;
            token.name = this.environmentService.chainInfo.chainName;
            break;
          case ETokenCoinTypeBE.CW20:
            type = ContractRegisterType.CW20;
            modeToken = EModeToken.CWToken;
            break;
          case ETokenCoinTypeBE.IBC:
            modeToken = EModeToken.IBCCoin;
            break;
        }

        const holder =
          token?.tokenHolderStatistics?.length > 0
            ? token?.tokenHolderStatistics?.[token?.tokenHolderStatistics?.length - 1]?.totalHolder
            : 0;
        let changePercent = 0;
        if (
          token.tokenHolderStatistics?.length > 1 &&
          token.tokenHolderStatistics[0]?.totalHolder > 0 &&
          token.tokenHolderStatistics[1]?.totalHolder > 0
        ) {
          changePercent =
            (token.tokenHolderStatistics[1].totalHolder * 100) / token.tokenHolderStatistics[0].totalHolder - 100;
        }

        this.tokenDetail = {
          ...token,
          type,
          modeToken,
          holder,
          isHolderUp: changePercent >= 0,
          holderChange: Math.abs(changePercent),
          supplyAmount: token.totalSupply,
          price: token.currentPrice,
          decimals: token.decimal,
          denomHash: token.denom
        };

        if (this.contractAddress !== this.chainInfo?.currencies[0].coinMinimalDenom) {
          this.getInfoTokenIBC(this.tokenDetail.denom);
        }
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

  getTokenDetailNFT(): void {
    this.contractService.loadContractDetail(this.contractAddress).subscribe({
      next: (res) => {
        const name = _.get(res, 'smart_contract[0].cw721_contract.name');
        let type = ContractRegisterType.CW721;
        if (res.smart_contract[0]?.name === TYPE_CW4973) {
          type = ContractRegisterType.CW4973;
        }
        const isNFTContract = true;
        const contract_address = _.get(res, 'smart_contract[0].address');
        const modeToken = EModeToken.CWToken;
        this.tokenDetail = { name, type, contract_address, isNFTContract, modeToken };
        this.tokenDetail.contract_verification =
          res.smart_contract[0].code.code_id_verifications[0]?.verification_status;
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

  // getDataCoin() {
  //   const listTokenIBC = local.getItem<any>(STORAGE_KEYS.LIST_TOKEN_IBC);
  //   let findData = listTokenIBC?.find((k) => k['denom']?.indexOf(this.contractAddress) > 0);
  //   // check exit ibc denom
  //   if (!findData) {
  //     this.loading = false;
  //     this.errTxt = 'No Data';
  //   }
  //   this.getInfoTokenIBC(findData);
  // }

  getInfoTokenIBC(denom) {
    this.ibcService.getChannelInfoByDenom(encodeURIComponent(denom)).subscribe((res) => {
      this.tokenDetail['channelPath'] = _.get(res, 'denom_trace');
    });
  }
}
