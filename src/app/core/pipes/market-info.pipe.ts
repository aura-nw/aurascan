import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';
import { CommonService } from '../services/common.service';
import { getBalance } from '../utils/common/parsing';

@Pipe({ name: 'marketInfo' })
export class MarketInfoPipe implements PipeTransform {
  image_s3 = this.env.imageUrl;
  defaultLogoToken = `${this.image_s3}images/icons/aura.svg`;

  constructor(
    private env: EnvironmentService,
    private token: TokenService,
  ) {}

  transform(value: any, key?: 'logo' | 'name' | 'symbol'): any {
    let marketInfo = {
      logo: this.defaultLogoToken,
      symbol: '',
      name: '',
    };

    if (!value) {
      return marketInfo;
    }

    const tokenMarket = this.token.tokensMarket || [];
    const { cw20_contract, erc20_contract } = value;
    if (cw20_contract) {
      marketInfo = {
        logo: cw20_contract?.marketing_info?.logo?.url || this.defaultLogoToken,
        symbol: cw20_contract?.symbol || '',
        name: cw20_contract?.name || '',
      };
    } else if (erc20_contract) {
      marketInfo = {
        logo: erc20_contract?.marketing_info?.logo?.url || this.defaultLogoToken,
        symbol: erc20_contract?.symbol || '',
        name: erc20_contract?.name || '',
      };
    }

    if (cw20_contract?.smart_contract?.address) {
      // cw20 type
      const address = cw20_contract.smart_contract.address;
      const tokenCw20 = tokenMarket.find((t) => t.contract_address === address);
      if (tokenCw20) {
        marketInfo = {
          logo: tokenCw20.image || marketInfo.logo,
          symbol: tokenCw20.symbol || marketInfo.symbol,
          name: tokenCw20.name || marketInfo.name,
        };
      }
    } else if (cw20_contract?.ibc_denom) {
      // ibc type
      const tokenIbc = tokenMarket?.find((t) => t.denom === cw20_contract.ibc_denom);
      if (tokenIbc) {
        marketInfo = {
          logo: tokenIbc.image || marketInfo.logo,
          symbol: tokenIbc.symbol || marketInfo.symbol,
          name: tokenIbc.name || marketInfo.name,
        };
      }
    }

    return key ? marketInfo[key] : marketInfo;
  }
}

@Pipe({ name: 'ibcDenom' })
export class IbcDenomPipe implements PipeTransform {
  coinMinimalDenom = this.environmentService.chainInfo.currencies[0].coinMinimalDenom;

  constructor(
    private commonService: CommonService,
    private environmentService: EnvironmentService,
  ) {}

  transform(value: string, amount?: string): string {
    if (!value) return '';
    const isIbc = value.startsWith('ibc');

    let data = this.commonService.mappingNameIBC(value);
    if (!amount) {
      return data['display'];
    }

    const linkToken = isIbc ? value?.replace('ibc/', '') : this.coinMinimalDenom;
    const balance = BigNumber(getBalance(amount, data['decimals']));

    return balance.lte(0)
      ? '-'
      : balance.toFormat() + `<a class="text--primary ml-1" href='/token/${linkToken}'>${data['display']}</a>`;
  }
}
