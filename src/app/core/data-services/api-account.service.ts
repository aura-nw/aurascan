import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { EMPTY, expand, forkJoin, map, Observable, reduce, tap } from 'rxjs';
import { balanceOf } from '../utils/common/parsing';
import { EnvironmentService } from './environment.service';
import { VALIDATOR_ACCOUNT_TEMPLATE } from './template';

export interface IApiAccount {
  acc_address: string;
  available: string | number;
  delegable_vesting: string;
  delegated: string;
  unbonding: string;
  stake_reward: string;
  commission: string;
  total: string;
  balances: { name: string; denom: string; amount: string; price: number; total_price: number }[];
  delegations: {
    validator_name: string;
    validator_address: string;
    amount: string;
    reward: string;
    validator_identity: string;
    image_url: string;
    jailed: number;
  }[];
  unbonding_delegations: {
    validator_name: string;
    validator_address: string;
    amount: string;
    completion_time: string;
    validator_identity: string;
    image_url: string;
    jailed: number;
  }[];
  redelegations: {
    validator_src_name: string;
    validator_src_address: string;
    validator_dst_name: string;
    validator_dst_address: string;
    amount: string;
    completion_time: string;
    validator_src_identity: string;
    validator_dst_identity: string;
    validator_src_jailed: number;
    validator_dst_jailed: number;
    image_src_url: string;
    image_dst_url: string;
  }[];
  vesting: { type: string; amount: string; vesting_schedule: string };
}

@Injectable({ providedIn: 'root' })
export class ApiAccountService {
  horoscope = this.env.horoscope;
  lcd = this.env.chainConfig.chain_info.rest;

  chainInfo = this.env.chainInfo;

  constructor(private http: HttpClient, private env: EnvironmentService) {}

  getAccountByAddress(address: string) {
    forkJoin([
      this.queryAccountAndValidator(address),
      this.getDelegations(address),
      this.getUnbonding(address),
      this.getRedelegations(address),
      this.getAccount(address),
    ])
      .pipe(
        map((res) => {
          const [accountAndValidator, DelegationsParam, UnbondingParam, RedelegationsParam, ParamAccount] = res;
          console.log(UnbondingParam);

          let data: Partial<IApiAccount> = {
            acc_address: address,
            available: this.parseAvailableBalance(accountAndValidator.account),
            balances: [this.parseBalance(accountAndValidator.account)],
          };

          return data;
        }),
      )
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  // https://github.com/aura-nw/aura-explorer-api/blob/main/src/components/account/services/account.service.ts#L117
  parseBalance(account) {
    return account
      ? account[0]?.balances.find((item) => item.denom === this.chainInfo.currencies[0]?.coinMinimalDenom)
      : [];
  }

  // https://github.com/aura-nw/aura-explorer-api/blob/main/src/components/account/services/account.service.ts#L132
  parseAvailableBalance(account) {
    if (account) {
      const spendable_balances = account[0]?.spendable_balances;

      const value = spendable_balances?.find((f) => f.denom === this.chainInfo.currencies[0].coinMinimalDenom);

      if (value) {
        const amount = value.amount;

        return balanceOf(amount, this.chainInfo.currencies[0].coinDecimals);
      }
    }

    return 0;
  }

  // https://github.com/aura-nw/aura-explorer-api/blob/main/src/components/account/services/account.service.ts#L165
  parseDelegations(accountDelegations: any[]) {
    if (accountDelegations.length > 0) {
    }
    return {};
  }

  // https://github.com/aura-nw/aura-explorer-api/blob/main/src/components/account/services/account.service.ts#L98
  queryAccountAndValidator(address: string) {
    const query = {
      query: VALIDATOR_ACCOUNT_TEMPLATE({ chain: this.horoscope.chain }),
      variables: {
        account_address: address,
      },
      operationName: 'VALIDATOR_ACCOUNT_TEMPLATE',
    };

    return this.http
      .post<any>(this.env.graphql, query)
      .pipe(map((res) => (res?.data ? res?.data[this.horoscope.chain] : null)));
  }

  // https://github.com/aura-nw/aura-explorer-api/blob/main/src/components/account/services/account.service.ts#L149
  getDelegations(address: string, nextKey?: string): Observable<any> {
    const api: Observable<any> = this.http.get(`${this.lcd}/cosmos/staking/v1beta1/delegations/${address}`, {
      params: {
        ['pagination.count_total']: true,
        ['pagination.key']: nextKey ? nextKey : '',
      },
    });

    return api.pipe(
      expand((data) =>
        data.pagination.next_key ? this.getDelegations(address, `${data.pagination.next_key}`) : EMPTY,
      ),
      reduce((acc, val) => {
        return [...acc, ...val.delegation_responses];
      }, []),
    );
  }

  getUnbonding(address: string) {
    return this.http.get(`${this.lcd}/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`);
  }

  getRedelegations(address: string) {
    return this.http.get(`${this.lcd}/cosmos/staking/v1beta1/delegators/${address}/redelegations`);
  }

  getAccount(address: string) {
    return this.http.get(`${this.lcd}/cosmos/auth/v1beta1/accounts/${address}`);
  }
}
