import {Pipe, PipeTransform} from "@angular/core";
import {EnvironmentService} from "src/app/core/data-services/environment.service";
import {TokenService} from "src/app/core/services/token.service";

@Pipe({ name: 'marketInfo' })
export class MarketInfo implements PipeTransform {
  tokenMarket = this.tokenService.listTokenMarket;
  constructor(
    private environmentService: EnvironmentService,
    private tokenService: TokenService
  ) {}
  transform(value: any,key?: string): any {
    const image_s3 = this.environmentService.imageUrl;
    const defaultLogoToken = image_s3 + 'images/icons/token-logo.png';
    let logo = value?.cw20_contract?.marketing_info?.logo?.url || defaultLogoToken;
    let symbol = value?.cw20_contract.symbol || '';
    let name = value?.cw20_contract.name || '';
    if (value?.cw20_contract?.smart_contract?.address) {
      // cw20 type
      const address = value.cw20_contract.smart_contract.address;
      this.tokenMarket.forEach(t => {
        if(t.contract_address === address) {
          logo = t.image || defaultLogoToken;
          name = t.name || name;
          symbol = t.symbol || symbol
        }
      })
    } else {
      // ibc type
      if(value?.cw20_contract.ibc_denom) {
        this.tokenMarket.forEach(t => {
          if(t.denom === value?.cw20_contract.ibc_denom) {
            logo = t.image || defaultLogoToken;
            name = t.name || name;
            symbol = t.symbol || symbol
          }
        })
      }     
    }
    let dataInfo = { logo, name, symbol };
    switch (key) {
      case 'logo':
        return dataInfo.logo;
      case 'name':
        return dataInfo.name;
      case 'symbol':
        return dataInfo.symbol;
      default:
        return dataInfo;
    }
  }
}