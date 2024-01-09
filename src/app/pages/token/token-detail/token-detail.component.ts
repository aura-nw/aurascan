import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { filter, take } from 'rxjs';
import { DATEFORMAT, STORAGE_KEYS, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EModeToken } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { IBCService } from 'src/app/core/services/ibc.service';
import { TokenService } from 'src/app/core/services/token.service';
import { getBalance } from 'src/app/core/utils/common/parsing';
import local from 'src/app/core/utils/storage/local';

@Component({
  selector: 'app-token-detail',
  templateUrl: './token-detail.component.html',
  styleUrls: ['./token-detail.component.scss'],
})
export class TokenDetailComponent implements OnInit {
  loading = true;
  contractAddress = '';
  tokenDetail: any;
  image_s3 = this.environmentService.imageUrl;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';
  contractType = ContractRegisterType;
  errTxt: string;
  EModeToken = EModeToken;

  chainInfo = this.environmentService.chainInfo;

  constructor(
    private router: ActivatedRoute,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    private contractService: ContractService,
    private datePipe: DatePipe,
    private ibcService: IBCService,
  ) {}

  ngOnInit(): void {
    const paramData = this.router.snapshot.paramMap.get('contractAddress');
    if (paramData?.startsWith(this.chainInfo.bech32Config.bech32PrefixAccAddr)) {
      this.contractAddress = paramData;
      if (this.router.snapshot.url[0]?.path === 'token') {
        this.getTokenDetail();
      } else {
        this.getTokenDetailNFT();
      }
    } else {
      //check is native coin
      if (paramData === this.chainInfo?.currencies[0].coinMinimalDenom) {
        this.getDataNative(paramData);
      } else {
        this.getDataCoin(paramData);
      }
    }
  }

  getTokenDetail(): void {
    let now = new Date();
    now.setDate(now.getDate() - 1);
    this.tokenService
      .getTokenDetail(this.contractAddress, this.datePipe.transform(now, DATEFORMAT.DATE_ONLY))
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
                const tokenMarket = item.find((token) => token.contract_address === data[0].address);

                const token = data[0];
                // const tokenMarket = item.length > 0 ? item[0] : null;
                token.contract_address = token.address;
                token.name = tokenMarket?.name || token.cw20_contract.name;
                token.symbol = tokenMarket?.symbol || token.cw20_contract.symbol;
                token.decimals = token.cw20_contract.decimal;
                token.type = this.contractType.CW20;
                token.max_total_supply = tokenMarket?.max_supply || 0;
                token.price = tokenMarket?.current_price || 0;
                token.verify_status = tokenMarket?.verify_status || '';
                token.verify_text = tokenMarket?.verify_text || '';
                token.modeToken = EModeToken.CWToken;
                token.price_change_percentage_24h = tokenMarket?.price_change_percentage_24h || 0;
                token.contract_verification = token.code?.code_id_verifications[0]?.verification_status;
                token.totalSupply = token.cw20_contract.total_supply;
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

  getLength(result: string) {
    this.tokenDetail['totalTransfer'] = Number(result) || 0;
  }

  getMoreTx(event) {
    this.tokenDetail['hasMoreTx'] = event;
  }

  getDataCoin(denom) {
    const listTokenIBC = local.getItem<any>(STORAGE_KEYS.LIST_TOKEN_IBC);
    let findData = listTokenIBC?.find((k) => k['denom']?.indexOf(denom) > 0);
    // check exit ibc denom
    if (!findData) {
      this.loading = false;
      this.errTxt = 'No Data';
    }
    this.getInfoTokenIBC(findData);
  }

  async getInfoTokenIBC(data) {
    const [denom, channel] = await Promise.all([
      this.ibcService.getTotalSupplyLCD(encodeURIComponent(data?.denom)),
      this.ibcService.getChannelInfoByDenom(encodeURIComponent(data?.denom)),
    ]);

    const decimals = data?.decimal || this.chainInfo?.currencies[0].coinDecimals;
    this.tokenDetail = {
      modeToken: data?.denom ? EModeToken.IBCCoin : EModeToken.Native,
      denomHash: data?.denom,
      name: data?.name,
      price: data?.current_price || 0,
      symbol: data?.symbol || data?.display,
      isValueUp: data?.price_change_percentage_24h && data?.price_change_percentage_24h >= 0,
      change: data?.price_change_percentage_24h || 0,
      decimals,
      totalSupply: _.get(denom, 'data.amount.amount' || 0),
      channelPath: _.get(channel, 'data.denom_trace'),
    };
    this.loading = false;
  }

  async getDataNative(denomNative: string) {
    const tempTotal = await this.ibcService.getTotalSupplyLCD(denomNative);
    this.tokenDetail = {
      modeToken: EModeToken.Native,
      name: this.chainInfo.chainName,
      denomHash: this.chainInfo?.currencies[0].coinMinimalDenom,
      symbol: this.chainInfo?.currencies[0].coinDenom,
      isValueUp: false,
      price: this.tokenService.nativePrice || 0,
      change: 0,
      decimals: this.chainInfo?.currencies[0].coinDecimals,
      totalSupply: _.get(tempTotal, 'data.amount.amount' || 0),
    };
    this.loading = false;
  }
}
