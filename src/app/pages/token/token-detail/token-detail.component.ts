import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import { filter, take } from 'rxjs';
import { DATEFORMAT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
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
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.contractAddress = this.router.snapshot.paramMap.get('contractAddress');
    if (this.contractAddress?.startsWith(this.chainInfo.bech32Config.bech32PrefixAccAddr)) {
      if (this.router.snapshot.url[0]?.path === 'token') {
        this.getCW20Detail();
      } else {
        this.getTokenDetailNFT();
      }
    } else {
      this.getTokenDetail();
    }
  }

  getCW20Detail(): void {
    let now = new Date();
    now.setDate(now.getDate() - 1);
    this.tokenService
      .getCW20Detail(this.contractAddress, this.datePipe.transform(now, DATEFORMAT.DATE_ONLY))
      .subscribe({
        next: (res) => {
          const data = _.get(res, `smart_contract`);
          if (data.length > 0) {
            this.tokenService.tokensMarket$
              .pipe(
                filter((data) => _.isArray(data)),
                take(1),
              )
              .subscribe((item) => {
                const tokenMarket = item.find((token) => token.denom === data[0].address);

                const token = data[0];
                token.contract_address = token.address;
                token.name = tokenMarket?.name || token.cw20_contract.name;
                token.symbol = tokenMarket?.symbol || token.cw20_contract.symbol;
                token.decimals = token.cw20_contract.decimal;
                token.type = this.contractType.CW20;
                token.max_total_supply = tokenMarket?.max_supply || 0;
                token.price = tokenMarket?.currentPrice || 0;
                token.verify_status = tokenMarket?.verifyStatus || '';
                token.verify_text = tokenMarket?.verifyText || '';
                token.modeToken = EModeToken.CWToken;
                token.priceChangePercentage24h = tokenMarket?.priceChangePercentage24h || 0;
                token.contract_verification = token.code?.code_id_verifications[0]?.verification_status;
                token.supplyAmount = BigNumber(token.cw20_contract?.total_supply).dividedBy(
                  BigNumber(10).pow(token.decimals),
                );
                this.tokenDetail = token;
              });
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

  getTokenDetail(): void {
    this.tokenService.getTokenDetail(this.contractAddress).subscribe({
      next: (token) => {
        if (!token) {
          this.loading = false;
          this.errTxt = 'No Data';
          return;
        }

        let type;
        let modeToken;
        switch (token.type) {
          case ETokenCoinTypeBE.NATIVE:
            modeToken = EModeToken.Native;
            token.symbol = this.chainInfo?.currencies[0].coinDenom;
            token.name = this.environmentService.chainInfo.chainName;
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
          denomHash: token.denom,
          verify_status: token.verifyStatus,
          verify_text: token.verifyText,
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

  getInfoTokenIBC(denom) {
    this.ibcService.getChannelInfoByDenom(encodeURIComponent(denom)).subscribe((res) => {
      this.tokenDetail['channelPath'] = _.get(res, 'denom_trace');
      this.tokenService.pathDenom$.next(_.get(res, 'denom_trace'));
    });
  }
}
