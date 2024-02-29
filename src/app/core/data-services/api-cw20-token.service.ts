import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import { catchError, filter, forkJoin, map, of, take } from 'rxjs';
import { COIN_TOKEN_TYPE, TOKEN_ID_GET_PRICE } from '../constants/common.constant';
import { TokenService } from '../services/token.service';
import { balanceOf, getBalance } from '../utils/common/parsing';
import { ApiAccountService } from './api-account.service';
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
  value: number | string;
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
  nativeName = this.env.environment.nativeName;

  apiAccount = inject(ApiAccountService);

  constructor(
    private http: HttpClient,
    private env: EnvironmentService,
    private tokenService: TokenService,
  ) {}

  getByOwner(address: string) {
    return forkJoin([
      this.queryCw20TokenByOwner(address),
      this.apiAccount.getAccountByAddress(address, true),
      this.tokenService.tokensMarket$.pipe(
        filter((data) => _.isArray(data)),
        take(1),
      ),
    ]).pipe(
      map((data) => {
        const [cw20Tokens, account, coinsMarkets] = data;

        const nativeToken = this.parseNativeToken(account, coinsMarkets);

        const cw20TokenList: any[] = this.parseCw20Tokens(cw20Tokens, coinsMarkets) || [];

        const ibcTokenBalances = this.parseIbcTokens(account, coinsMarkets) || [];

        // get coin native && token balance > 0
        const tokens = [...ibcTokenBalances, ...cw20TokenList].filter((token) => BigNumber(token.balance).gt(0));

        const allTokens = [nativeToken, ...tokens];

        const totalValue = allTokens
          .filter((item) => item.verify_status === 'VERIFIED')
          .reduce(
            (prev, current) =>
              BigNumber(current?.value)
                .plus(prev)
                .toFixed(),
            0,
          );

        return { data: allTokens, meta: { count: allTokens.length }, totalValue };
      }),
    );
  }

  parseCw20Tokens(tokens, coinsMarkets) {
    return tokens
      .map((item): Partial<IAsset> => {
        const coinMarket = coinsMarkets.find(
          (coin) => coin.contract_address === item.cw20_contract.smart_contract.address,
        );

        const amount = getBalance(item?.amount, item?.cw20_contract?.decimal || this.currencies.coinDecimals);
        const value = new BigNumber(amount).multipliedBy(coinMarket?.current_price || 0);

        return {
          name: coinMarket?.name || item?.cw20_contract?.name,
          symbol: coinMarket?.symbol || item?.cw20_contract?.symbol,
          decimals: item?.cw20_contract?.decimal,
          image: coinMarket?.image || item?.cw20_contract?.marketing_info?.logo?.url,
          max_total_supply: item?.cw20_contract?.total_supply,
          contract_address: item?.cw20_contract?.smart_contract?.address || '-',
          balance: item?.amount,
          price: coinMarket?.current_price || 0,
          price_change_percentage_24h: coinMarket?.price_change_percentage_24h || 0,
          type: COIN_TOKEN_TYPE.CW20,
          value: value.toFixed(),
          verify_status: coinMarket?.verify_status || '',
          verify_text: coinMarket?.verify_text || '',
        };
      })
      .sort((item1, item2) => {
        // 1st priority VERIFIED.
        const compareStatus = item2.verify_status.localeCompare(item1.verify_status);
        // 2nd priority token value DESC.
        const compareValue = new BigNumber(item2.value).comparedTo(item1.value);
        return compareStatus || compareValue;
      });
  }

  parseNativeToken(account, coinsMarkets) {
    const nativeId = this.env.coingecko.ids[0];
    const coinMarket = coinsMarkets.find((coin) => coin.coinId === nativeId);
    return {
      name: this.env.chainName,
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
      type: COIN_TOKEN_TYPE.NATIVE,
      verify_status: coinMarket?.verify_status || 'VERIFIED',
      verify_text: coinMarket?.verify_text || 'Verified by Aura Network',
    };
  }

  parseIbcTokens(account, coinsMarkets): IAsset[] {
    const ibcBalances = account.data?.balances?.filter((balance) => balance.denom !== this.currencies.coinMinimalDenom);
    return ibcBalances
      ? ibcBalances
          .map((item): Partial<IAsset> => {
            const coinMarket = coinsMarkets.find((coin) => item.denom === coin.denom);
            const amount = getBalance(item?.amount, item?.cw20_contract?.decimal || this.currencies.coinDecimals);
            const value = new BigNumber(amount).multipliedBy(coinMarket?.current_price || 0);
            return coinMarket
              ? {
                  name: coinMarket?.name,
                  symbol: coinMarket?.symbol,
                  decimals: coinMarket?.decimal,
                  denom: coinMarket?.denom,
                  image: coinMarket?.image,
                  max_total_supply: 0,
                  contract_address: '-',
                  balance: balanceOf(item.amount, this.currencies.coinDecimals),
                  price: coinMarket?.current_price || 0,
                  price_change_percentage_24h: coinMarket?.price_change_percentage_24h || 0,
                  value: value.toFixed(),
                  type: COIN_TOKEN_TYPE.IBC,
                  verify_status: coinMarket?.verify_status || '',
                  verify_text: coinMarket?.verify_text || '',
                }
              : null;
          })
          .filter((data) => data !== null)
          .sort((item1, item2) => {
            // 1st priority VERIFIED.
            const compareStatus = item2.verify_status.localeCompare(item1.verify_status);
            // 2nd priority token value DESC.
            const compareValue = new BigNumber(item2.value).comparedTo(item1.value);
            return compareStatus || compareValue;
          })
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
