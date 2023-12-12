import {Pipe, PipeTransform} from '@angular/core';
import {EnvironmentService} from 'src/app/core/data-services/environment.service';
import {TokenService} from 'src/app/core/services/token.service';

@Pipe({name: 'marketInfo'})
export class MarketInfoPipe implements PipeTransform {
  image_s3 = this.env.imageUrl;
  defaultLogoToken = `${this.image_s3}images/icons/token-logo.png`;

  constructor(private env: EnvironmentService, private token: TokenService) {
  }

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

    const {cw20_contract, ibc_denom} = value;
    if (cw20_contract) {
      marketInfo = {
        logo: cw20_contract?.marketing_info?.logo?.url || this.defaultLogoToken,
        symbol: cw20_contract?.symbol || '',
        name: cw20_contract?.name || '',
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
    } else if (ibc_denom) {
      // ibc type
      const tokenIbc = tokenMarket.find((t) => t.denom === ibc_denom);
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
