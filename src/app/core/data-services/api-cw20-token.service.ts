import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, take } from 'rxjs';
import { balanceOf } from '../utils/common/parsing';
import { ApiAccountService } from './api-account.service';
import { CoingeckoService } from './coingecko.service';
import { EnvironmentService } from './environment.service';
import { CW20_TOKENS_TEMPLATE } from './template';
import { TokenService } from '../services/token.service';
import { TOKEN_ID_GET_PRICE } from '../constants/common.constant';

export interface IAsset {
  name: string;
  symbol: string;
  image: string;
  contract_address: string;
  balance: number;
  max_total_supply: number;
  price: number;
  price_change_percentage_24h: number;
  value: number;
  denom: string;
  decimals: number;
  verify_status: string;
  verify_text: string;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class ApiCw20TokenService {
  horoscope = this.env.horoscope;
  lcd = this.env.chainConfig.chain_info.rest;

  chainInfo = this.env.chainInfo;
  currencies = this.chainInfo.currencies[0];

  apiAccount = inject(ApiAccountService);

  constructor(
    private http: HttpClient,
    private env: EnvironmentService,
    private tokenService: TokenService
    ) {}

  getByOwner(address: string) {
    return forkJoin([
      this.queryCw20TokenByOwner(address),
      this.apiAccount.getAccountByAddress(address, true),
      this.tokenService.getTokenMarketData()
    ]).pipe(
      map((data) => {
        const [cw20Tokens, account, coinsMarkets] = data;

        const nativeToken = this.parseNativeToken(account, coinsMarkets);

        const cw20TokenList: any[] = this.parseCw20Tokens(cw20Tokens, coinsMarkets);

        const ibcTokenBalances = this.parseIbcTokens(account, coinsMarkets);



        const allTokens = [nativeToken, ...ibcTokenBalances, ...cw20TokenList]
          .filter((token) => Number(token.balance) > 0);          

        const totalValue = allTokens.filter((item) => item.verify_status === 'VERIFIED').reduce((prev, current) => current?.value + prev, 0);

        return { data: allTokens, meta: { count: allTokens.length }, totalValue };
      }),
    );
  }

  parseCw20Tokens(tokens, coinsMarkets) {
    return tokens
      .map(
        (item): Partial<IAsset> => {
        const coinMarket = coinsMarkets.find((coin) => coin.contract_address === item.cw20_contract.smart_contract.address);        
        return  {
            name: coinMarket?.name || item?.cw20_contract?.name,
            symbol: coinMarket?.symbol || item?.cw20_contract?.symbol,
            decimals: item?.cw20_contract?.decimal,
            image: coinMarket?.image || item?.cw20_contract?.marketing_info?.logo?.url,
            max_total_supply: item?.cw20_contract?.total_supply,
            contract_address: item?.cw20_contract?.smart_contract?.address || '-',
            balance: item?.amount,
            price: coinMarket?.current_price || 0,
            price_change_percentage_24h: coinMarket?.price_change_percentage_24h || 0, 
            type: 'cw20',
            value: item?.amount * coinMarket?.current_price || 0,
            verify_status: coinMarket?.verify_status || '',
            verify_text: coinMarket?.verify_text || '',
        };
    },
      )
      .sort((item1, item2) => {
        // 1st priority VERIFIED.
        const compareStatus = item2.verify_status.localeCompare(item1.verify_status);
        // 2nd priority token value DESC.
        const compareValue = item2.value - item1.value;
        return compareStatus || compareValue;
      });
  }

  parseNativeToken(account, coinsMarkets) {
    const coinMarket = coinsMarkets.find((coin) => coin.coin_id === TOKEN_ID_GET_PRICE.AURA);
    return {
      name: 'Aura',
      symbol: this.currencies.coinDenom,
      decimals: this.currencies.coinDecimals,
      denom: this.currencies.coinMinimalDenom,
      image: this.currencies.coinImageUrl,
      contract_address: '-',
      balance: account.data.total,
      price: coinMarket?.current_price || 0,
      price_change_percentage_24h: coinMarket?.price_change_percentage_24h || 0,
      value: account.data.total * coinMarket?.current_price || 0,
      max_total_supply: coinMarket?.max_total_supply || 0,  
      type: 'native',
      verify_status: 'VERIFIED',
      verify_text: 'Verified by Aura Network',
    };
  }

  parseIbcTokens(account, coinsMarkets): IAsset[] {
    const ibcBalances = account.data?.balances?.filter((balance) => balance.denom !== this.currencies.coinMinimalDenom);

    return ibcBalances
      ? ibcBalances
          .map((item): Partial<IAsset> => {
            const coinMarket = coinsMarkets.find((coin) => item.denom === coin.denom);
            return coinMarket
              ? {
                  name: coinMarket?.name,
                  symbol: coinMarket?.symbol,
                  decimals: coinMarket?.decimal,
                  denom: coinMarket?.denom,
                  image:  coinMarket?.image,
                  max_total_supply: 0,
                  contract_address: '-',
                  balance: balanceOf(item.amount, this.currencies.coinDecimals),
                  price: coinMarket?.current_price || 0,
                  price_change_percentage_24h: coinMarket?.price_change_percentage_24h || 0,
                  value: balanceOf(item.amount, this.currencies.coinDecimals) * coinMarket?.current_price || 0,
                  type: 'ibc',
                  verify_status: coinMarket?.verify_status || '',
                  verify_text: coinMarket?.verify_text || '',
                }
              : null;
          })
          .filter((data) => data !== null)
      : [];
  }

  queryCw20TokenByOwner(address: string) {
    const query = {
      query: CW20_TOKENS_TEMPLATE({ chain: this.horoscope.chain }),
      variables: {
        address,
      },
      operationName: 'CW20_TOKENS_TEMPLATE',
    };

    return this.http.post<any>(this.env.graphql, query).pipe(
      map((res) => (res?.data ? res?.data[this.horoscope.chain] : null)),
      map((data) => data?.cw20_holder),
    );
  }
}