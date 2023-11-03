import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { balanceOf } from '../utils/common/parsing';
import { ApiAccountService } from './api-account.service';
import { CoingeckoService } from './coingecko.service';
import { EnvironmentService } from './environment.service';
import { CW20_TOKENS_TEMPLATE } from './template';

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

  constructor(private http: HttpClient, private env: EnvironmentService, private coingecko: CoingeckoService) {}

  getByOwner(address: string) {
    return forkJoin([
      this.queryCw20TokenByOwner(address),
      this.apiAccount.getAccountByAddress(address, true),
      this.coingecko.getCoinMarkets(),
    ]).pipe(
      map((data) => {
        const [cw20Tokens, account, coinsMarkets] = data;

        const nativeToken = this.parseNativeToken(account);

        const cw20TokenList: any[] = this.parseCw20Tokens(cw20Tokens);

        const ibcTokenBalances = this.parseIbcTokens(account);

        const allTokens = [nativeToken, ...ibcTokenBalances, ...cw20TokenList]
          .filter((token) => Number(token.balance) > 0)
          .map((token) => {
            const symbol = token.symbol.toLowerCase();

            const coinMarket = coinsMarkets.find((coin) => coin.symbol.toLowerCase() === symbol);

            return coinMarket
              ? {
                  ...token,
                  price: coinMarket.current_price,
                  price_change_percentage_24h: coinMarket.price_change_percentage_24h,
                  value: token.balance * coinMarket.current_price,
                  max_total_supply: coinMarket.max_total_supply,
                }
              : token;
          });

        const totalValue = allTokens.reduce((prev, current) => current.value + prev, 0);

        return { data: allTokens, meta: { count: allTokens.length }, totalValue };
      }),
    );
  }

  parseCw20Tokens(tokens) {
    return tokens
      .map(
        (item): Partial<IAsset> => ({
          name: item?.cw20_contract?.name,
          symbol: item?.cw20_contract?.symbol,
          decimals: item?.cw20_contract?.decimal,
          image: item?.cw20_contract?.marketing_info?.logo?.url,
          max_total_supply: item?.cw20_contract?.total_supply,
          contract_address: item?.cw20_contract?.smart_contract?.address || '-',
          balance: item?.amount,
          price: 0, // TO-DO
          price_change_percentage_24h: 0, // TO-DO
          type: 'cw20', // TO-DO
          value: 0, // TO-DO
          verify_status: '', // TO-DO
          verify_text: '', // TO-DO
        }),
      )
      .sort((item1, item2) => {
        // 1st priority VERIFIED.
        const compareStatus = item2.verify_status.localeCompare(item1.verify_status);
        // 2nd priority token value DESC.
        const compareValue = item2.value - item1.value;
        return compareStatus || compareValue;
      });
  }

  parseNativeToken(account) {
    return {
      name: this.chainInfo.chainName,
      symbol: this.currencies.coinDenom,
      decimals: this.currencies.coinDecimals,
      denom: this.currencies.coinMinimalDenom,
      image: this.currencies.coinImageUrl,
      max_total_supply: 0,
      contract_address: '-',
      balance: account.data.total,
      price: 0,
      price_change_percentage_24h: 0,
      type: 'native',
      value: 0,
      verify_status: '',
      verify_text: '',
    };
  }

  parseIbcTokens(account): IAsset[] {
    const ibcBalances = account.data.balances.filter((balance) => balance.denom !== this.currencies.coinMinimalDenom);

    return ibcBalances
      .map((item): Partial<IAsset> => {
        const ibcToken = this.env.coins.find((coin) => coin.denom === item.denom);
        return ibcToken
          ? {
              name: ibcToken?.name,
              symbol: ibcToken?.display,
              decimals: ibcToken?.decimal,
              denom: ibcToken?.denom,
              image: ibcToken?.logo,
              max_total_supply: 0,
              contract_address: '-',
              balance: balanceOf(item.amount, this.currencies.coinDecimals),
              price: 0,
              price_change_percentage_24h: 0,
              type: 'ibc',
              value: 0,
              verify_status: '',
              verify_text: '',
            }
          : null;
      })
      .filter((data) => data !== null);
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
