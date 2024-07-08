import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import { filter, forkJoin, map, take } from 'rxjs';
import { COIN_TOKEN_TYPE } from '../constants/common.constant';
import { ETokenCoinTypeBE, USDC_ADDRESS, USDC_COIN_ID, USDC_TOKEN } from '../constants/token.constant';
import { TokenService } from '../services/token.service';
import { balanceOf, getBalance } from '../utils/common/parsing';
import { ApiAccountService } from './api-account.service';
import { EnvironmentService } from './environment.service';
import { CW20_TOKENS_TEMPLATE, ERC20_TOKENS_TEMPLATE } from './template';
import { getEthersProvider } from '../utils/ethers';
import { ERC20_ABI } from 'src/app/pages/account/account-detail/token-table/ABI/erc20-abi';
import { Contract } from 'ethers';

export interface IAsset {
  name: string;
  symbol: string;
  image: string;
  contract_address: string;
  balance: number;
  max_total_supply: number;
  price: number;
  priceChangePercentage24h: number;
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

  getByOwner(address: string, evmAddress: string) {
    return forkJoin([
      this.queryCw20TokenByOwner(address),
      this.queryERC20TokenByOwner(address),
      this.apiAccount.getAccountByAddress(address, true),
      this.getUSDCToken(evmAddress),
      this.tokenService.tokensMarket$.pipe(
        filter((data) => _.isArray(data)),
        take(1),
      ),
    ]).pipe(
      map((data) => {
        const [cw20Tokens, erc20Tokens, account, USDCToken, coinsMarkets] = data;

        const nativeToken = this.parseNativeToken(account, coinsMarkets);

        const cw20TokenList: any[] = this.parseCw20Tokens(cw20Tokens, coinsMarkets) || [];

        const erc20TokenList = this.parseErc20Tokens(erc20Tokens, coinsMarkets) || [];

        const ibcTokenBalances = this.parseIbcTokens(account, coinsMarkets) || [];

        // get coin native && token balance > 0
        const tokens = [...ibcTokenBalances, ...cw20TokenList, ...erc20TokenList].filter((token) =>
          BigNumber(token.balance).gt(0),
        );

        const usdcCoin = this.parseUSDCToken(USDCToken, coinsMarkets);
        
        const idx = tokens?.findIndex((f) => f.contract_address?.toLowerCase() === USDC_ADDRESS);
        if (idx >= 0) {
          tokens[idx] = usdcCoin;
        } else {
          tokens.push(usdcCoin);
        }

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

  createContract() {
    try {
      const provider = getEthersProvider(this.env.etherJsonRpc);

      let contract = new Contract(USDC_ADDRESS, ERC20_ABI, provider);
      return contract;
    } catch (error) {
      console.error(error);
    }

    return null;
  }

  async getUSDCToken(address: string) {
    const contract = this.createContract();
    const balance = await contract.balanceOf(address);
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    
    return {
      ...USDC_TOKEN,
      tokenUrl: USDC_ADDRESS,
      name: name?.toString(),
      symbol: symbol?.toString(),
      balance: Number(balance?.toString()),
      decimals: Number(decimals?.toString()),
    };
  }

  parseUSDCToken(token, coinsMarkets) {
    const USDCMarket = coinsMarkets?.find((item) => item.coinId === USDC_COIN_ID);
    const value = new BigNumber(token?.balance).multipliedBy(Number(USDCMarket?.currentPrice || 0));
    
    return {
      ...token,
      change: null,
      isValueUp: true,
      type: COIN_TOKEN_TYPE.ERC20,
      tokenUrl: USDC_ADDRESS,
      denom: USDC_ADDRESS,
      price: USDCMarket?.currentPrice || 0,
      priceChangePercentage24h: USDCMarket?.priceChangePercentage24h || 0,
      value: value.toNumber(),
      image: USDCMarket?.image,
      max_total_supply: USDCMarket?.totalSupply,
      verify_status: USDCMarket?.verifyStatus || '',
      verify_text: USDCMarket?.verifyText || '',
    };
  }

  parseErc20Tokens(tokens, coinsMarkets) {
    return tokens?.map((item) => {
      const coinMarket = coinsMarkets.find((coin) => coin.type === ETokenCoinTypeBE.ERC20 && coin.denom === item.denom);

      const amount = getBalance(item?.amount, coinMarket?.decimal || 0);

      const value = new BigNumber(amount).multipliedBy(coinMarket?.currentPrice || 0);

      return {
        name: coinMarket?.name,
        symbol: coinMarket?.symbol,
        decimals: coinMarket?.decimal,
        image: coinMarket?.image,
        max_total_supply: coinMarket?.totalSupply,
        contract_address: coinMarket?.denom || '-',
        denom: coinMarket?.denom,
        balance: coinMarket ? item?.amount : 0, // Only show token in Coin Markets
        price: coinMarket?.currentPrice || 0,
        priceChangePercentage24h: coinMarket?.priceChangePercentage24h || 0,
        type: COIN_TOKEN_TYPE.ERC20,
        value: value.toFixed(),
        verify_status: coinMarket?.verifyStatus || '',
        verify_text: coinMarket?.verifyText || '',
      };
    });
  }

  parseCw20Tokens(tokens, coinsMarkets) {
    return tokens
      .map((item): Partial<IAsset> => {
        const coinMarket = coinsMarkets.find(
          (coin) => coin.type === ETokenCoinTypeBE.CW20 && coin.denom === item.cw20_contract.smart_contract.address,
        );

        const amount = getBalance(item?.amount, item?.cw20_contract?.decimal || this.currencies.coinDecimals);
        const value = new BigNumber(amount).multipliedBy(coinMarket?.currentPrice || 0);

        return {
          name: coinMarket?.name || item?.cw20_contract?.name,
          symbol: coinMarket?.symbol || item?.cw20_contract?.symbol,
          decimals: item?.cw20_contract?.decimal,
          image: coinMarket?.image || item?.cw20_contract?.marketing_info?.logo?.url,
          max_total_supply: item?.cw20_contract?.total_supply,
          contract_address: item?.cw20_contract?.smart_contract?.address || '-',
          balance: item?.amount,
          price: coinMarket?.currentPrice || 0,
          priceChangePercentage24h: coinMarket?.priceChangePercentage24h || 0,
          type: COIN_TOKEN_TYPE.CW20,
          value: value.toFixed(),
          verify_status: coinMarket?.verifyStatus || '',
          verify_text: coinMarket?.verifyText || '',
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
      price: coinMarket?.currentPrice || 0,
      priceChangePercentage24h: coinMarket?.priceChangePercentage24h || 0,
      value: account.data.total * coinMarket?.currentPrice || 0,
      max_total_supply: coinMarket?.max_total_supply || coinMarket?.totalSupply || 0,
      type: COIN_TOKEN_TYPE.NATIVE,
      verify_status: coinMarket?.verifyStatus || 'VERIFIED',
      verify_text: coinMarket?.verifyText || 'Verified by Aura Network',
    };
  }

  parseIbcTokens(account, coinsMarkets): IAsset[] {
    const ibcBalances = account.data?.balances?.filter((balance) => balance.denom !== this.currencies.coinMinimalDenom);
    return ibcBalances
      ? ibcBalances
          .map((item): Partial<IAsset> => {
            const coinMarket = coinsMarkets.find((coin) => item.denom === coin.denom);
            const amount = getBalance(item?.amount, item?.cw20_contract?.decimal || this.currencies.coinDecimals);
            const value = new BigNumber(amount).multipliedBy(coinMarket?.currentPrice || 0);
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
                  price: coinMarket?.currentPrice || 0,
                  priceChangePercentage24h: coinMarket?.priceChangePercentage24h || 0,
                  value: value.toFixed(),
                  type: COIN_TOKEN_TYPE.IBC,
                  verify_status: coinMarket?.verifyStatus || '',
                  verify_text: coinMarket?.verifyText || '',
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

  queryERC20TokenByOwner(address: string) {
    const query = {
      query: ERC20_TOKENS_TEMPLATE({ chain: this.horoscope.chain }),
      variables: {
        address,
      },
      operationName: 'ERC20_TOKENS_TEMPLATE',
    };

    return this.http.post<any>(this.env.graphql, query).pipe(
      map((res) => (res?.data ? res?.data[this.horoscope.chain] : null)),
      map((data) => data?.account_balance),
    );
  }
}
