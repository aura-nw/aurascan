import { Pipe, PipeTransform } from '@angular/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';

@Pipe({ name: 'marketInfo' })
export class MarketInfoPipe implements PipeTransform {
  tokenMarket = this.token.tokensMarket;

  constructor(private env: EnvironmentService, private token: TokenService) {}

  transform(value: any, key?: 'logo' | 'name' | 'symbol'): any {
    console.log(value);

    if (!value) {
      return {
        logo: '',
        symbol: '',
        name: '',
      };
    }

    const image_s3 = this.env.imageUrl;
    const defaultLogoToken = `${image_s3}images/icons/token-logo.png`;

    const { cw20_contract, ibc_denom } = value;

    let logo = cw20_contract?.marketing_info?.logo?.url || defaultLogoToken;
    let symbol = cw20_contract?.symbol || '';
    let name = cw20_contract?.name || '';

    if (cw20_contract?.smart_contract?.address) {
      // cw20 type
      const address = cw20_contract.smart_contract.address;
      const tokenCw20 = this.tokenMarket.find((t) => t.contract_address === address);
      if (tokenCw20) {
        logo = tokenCw20.image || logo;
        name = tokenCw20.name || name;
        symbol = tokenCw20.symbol || symbol;
      }
    } else if (ibc_denom) {
      // ibc type
      const tokenIbc = this.tokenMarket.find((t) => t.denom === ibc_denom);
      if (tokenIbc) {
        logo = tokenIbc.image || logo;
        name = tokenIbc.name || name;
        symbol = tokenIbc.symbol || symbol;
      }
    }

    const marketInfo = { logo, name, symbol };
    return key ? marketInfo[key] : marketInfo;
  }
}
