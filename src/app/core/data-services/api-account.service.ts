import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { catchError, EMPTY, expand, forkJoin, map, Observable, of, reduce, switchMap } from 'rxjs';
import { balanceOf } from '../utils/common/parsing';
import { EnvironmentService } from './environment.service';
import { VALIDATOR_ACCOUNT_TEMPLATE } from './template';

export interface IApiAccount {
  acc_address: string;
  available: string | number;
  delegable_vesting: string | number;
  delegated: string | number;
  unbonding: string | number;
  stake_reward: string | number;
  commission: string | number;
  total: string | number;
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
  vesting: { type: string; amount: string | number; vesting_schedule: string };
}

@Injectable({ providedIn: 'root' })
export class ApiAccountService {
  horoscope = this.env.horoscope;
  lcd = this.env.chainConfig.chain_info.rest;

  chainInfo = this.env.chainInfo;
  currencies = this.chainInfo.currencies[0];

  constructor(
    private http: HttpClient,
    private env: EnvironmentService,
  ) {}

  getAccountByAddress(address: string, isGetAlBalances = false) {
    return forkJoin([
      this.queryAccountAndValidator(address),
      this.getDelegations(address),
      this.getUnbonding(address),
      this.getRedelegations(address),
      this.getAccount(address),
    ]).pipe(
      map((res) => {
        const [accountAndValidator, delegationsData, unbondingData, redelegationsData, accountData] = res;

        const delegations: any[] = this.parseDelegations(delegationsData, accountAndValidator.validator);

        const delegated = delegations.reduce((previousValue, currentValue) => currentValue?.amount + previousValue, 0);

        const redelegations = this.parseRedelegations(redelegationsData, accountAndValidator.validator);

        const vesting = this.parseVestingAccount(accountData?.account);

        const { unbonding, unbonding_delegations } = this.parseUnbondingDelegations(
          unbondingData,
          accountAndValidator.validator,
        );

        const balance = this.parseBalance(accountAndValidator.account);

        const balances = this.parseBalance(accountAndValidator.account, isGetAlBalances);

        const available = this.parseAvailableBalance(accountAndValidator.account);

        const commission = balanceOf(accountAndValidator?.commission?.amount, this.currencies.coinDecimals) || 0;

        const stake_reward = delegationsData?.total
          ? balanceOf(delegationsData?.total, this.currencies.coinDecimals)
          : 0;

        const delegable_vesting = balance?.amount
          ? balanceOf(balance?.amount, this.currencies.coinDecimals) - available
          : 0;

        // https://github.com/aura-nw/aura-explorer-api/blob/main/src/components/account/services/account.service.ts#L382
        const total = available + delegated + unbonding + stake_reward + commission + delegable_vesting;

        const data: Partial<IApiAccount> = {
          acc_address: address,
          available,
          balances,
          delegations,
          stake_reward,
          delegated,
          commission,
          delegable_vesting,
          total,
          vesting,
          unbonding,
          unbonding_delegations,
          redelegations,
        };

        return { data };
      }),
    );
  }

  // https://github.com/aura-nw/aura-explorer-api/blob/main/src/components/account/services/account.service.ts#L117
  parseBalance(account, isGetAlBalances = false) {
    const defaultBalance = { amount: '0', denom: this.currencies.coinMinimalDenom };
    const balance = _.get(account, '[0].balances') || [];
    const balances = balance?.length > 0 ? account[0]?.balances : [defaultBalance];

    return isGetAlBalances
      ? balances
      : balance?.length > 0
        ? account[0]?.balances?.find((item) => item.denom === this.currencies.coinMinimalDenom)
        : defaultBalance;
  }

  // https://github.com/aura-nw/aura-explorer-api/blob/main/src/components/account/services/account.service.ts#L132
  parseAvailableBalance(account) {
    const spendableBalances = _.get(account, '[0].spendable_balances') || [];
    if (!Array.isArray(spendableBalances) || spendableBalances?.length == 0) {
      return 0;
    }

    const value = spendableBalances?.find((f) => f.denom === this.currencies.coinMinimalDenom);
    const amount = value?.amount || 0;
    return balanceOf(amount, this.currencies.coinDecimals);
  }

  // https://github.com/aura-nw/aura-explorer-api/blob/main/src/components/account/services/account.service.ts#L283
  parseRedelegations(redelegations, validatorList: any[]) {
    return redelegations?.redelegation_responses
      .map((data) => {
        const validator_src_address = data.redelegation.validator_src_address;
        const validator_dst_address = data.redelegation.validator_dst_address;

        const validatorSrc = validatorList.find((e) => e.operator_address === validator_src_address);
        let srcData = {};
        if (validatorSrc) {
          srcData = {
            validator_src_name: validatorSrc.description?.moniker,
            validator_src_address: validator_src_address,
            validator_src_identity: validatorSrc.description?.identity,
            validator_src_jailed: validatorSrc.jailed,
            image_src_url: validatorSrc.image_url,
          };
        }

        const validatorDst = validatorList.find((e) => e.operator_address === validator_dst_address);
        let dstData = {};
        if (validatorDst) {
          dstData = {
            validator_dst_name: validatorDst.description?.moniker,
            validator_dst_address: validator_dst_address,
            validator_dst_identity: validatorDst.description?.identity,
            validator_dst_jailed: validatorDst.jailed,
            image_dst_url: validatorDst.image_url,
          };
        }

        const entries = data.entries.map((item) => {
          return {
            ...srcData,
            ...dstData,
            amount: balanceOf(item?.balance, this.currencies.coinDecimals),
            completion_time: item?.redelegation_entry?.completion_time,
          };
        });

        return entries;
      })
      .flat();
  }

  // https://github.com/aura-nw/aura-explorer-api/blob/main/src/components/account/services/account.service.ts#L165
  parseDelegations(accountDelegations, validatorList: any[]) {
    if (accountDelegations) {
      const { rewards, delegations } = accountDelegations;

      const rewardList = rewards.rewards || [];

      return delegations
        .filter((delegation: any) => Number(delegation.balance?.amount) > 0)
        .map((delegation: any) => {
          const validatorInfo = validatorList.find(
            (validator) => validator.operator_address === delegation.delegation.validator_address,
          );

          const rewardData = rewardList.find(
            (item) => item.validator_address === delegation.delegation.validator_address,
          );

          const reward = _.get(rewardData, 'reward[0].amount') || 0;

          return {
            reward: balanceOf(reward, this.currencies.coinDecimals),
            validator_name: validatorInfo.description.moniker,
            validator_address: validatorInfo.operator_address,
            validator_identity: validatorInfo.description.identity,
            image_url: validatorInfo.image_url,
            jailed: validatorInfo.jailed,
            amount: balanceOf(delegation.balance.amount, this.currencies.coinDecimals),
          };
        });
    }

    return {};
  }

  // https://github.com/aura-nw/aura-explorer-api/blob/main/src/components/account/services/account.service.ts#L132
  parseVestingAccount(account: any) {
    if (account) {
      const baseVesting = account.base_vesting_account;

      if (baseVesting) {
        const type = account['@type'];

        const originalVesting = baseVesting.original_vesting || [];

        let amount = 0;
        if (originalVesting.length > 0) {
          const originalAmount = originalVesting.reduce(
            (accumulator, currentValue) => Number(currentValue?.amount) + accumulator,
            0,
          );

          amount = balanceOf(originalAmount, this.currencies.coinDecimals);
        }

        return { type, amount, vesting_schedule: baseVesting.end_time };
      }
    }
    return null;
  }

  // https://github.com/aura-nw/aura-explorer-api/blob/main/src/components/account/services/account.service.ts#L238
  parseUnbondingDelegations(unbondingDelegations, validatorData) {
    return unbondingDelegations
      ?.map((data) => {
        let unbonding = 0;
        const validator_address = data.validator_address;
        const validator = validatorData.filter((e) => e.operator_address === validator_address);

        const unbonding_delegations = data.entries.map((entry) => {
          let validator_name, validator_address, validator_identity, image_url, jailed, amount, completion_time;

          if (validator.length > 0) {
            validator_name = validator[0].description?.moniker;
            validator_address = validator_address;
            validator_identity = validator[0].description?.identity;
            image_url = validator[0].image_url;
            jailed = Number(validator[0].jailed);
          }

          amount = balanceOf(entry.balance, this.currencies.coinDecimals);
          completion_time = entry.completion_time;
          unbonding += +entry.balance;

          return {
            validator_name,
            validator_address,
            validator_identity,
            image_url,
            jailed,
            amount,
            completion_time,
          };
        });

        return {
          unbonding: balanceOf(unbonding, this.currencies.coinDecimals),
          unbonding_delegations,
        };
      })
      .reduce(
        (accumulator, currentValue) => ({
          unbonding: currentValue.unbonding + accumulator?.unbonding,
          unbonding_delegations: [...currentValue.unbonding_delegations, ...accumulator?.unbonding_delegations],
        }),
        {
          unbonding: 0,
          unbonding_delegations: [],
        },
      );
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

    return this.http.post<any>(this.env.graphql, query).pipe(
      map((res) => (res?.data ? res?.data[this.horoscope.chain] : null)),
      switchMap((data) => {
        const operatorAddress = data.validator?.find((dta) => dta.account_address === address)?.operator_address;

        if (operatorAddress) {
          return this.getCommission(operatorAddress).pipe(
            map((commission) => ({
              ...data,
              commission,
            })),
          );
        }
        return of(data);
      }),
    );
  }

  // https://github.com/aura-nw/aura-explorer-api/blob/main/src/components/account/services/account.service.ts#L149
  getDelegations(address: string, nextKey?: string): Observable<any> {
    const api: Observable<any> = this.http.get(`${this.lcd}/cosmos/staking/v1beta1/delegations/${address}`, {
      params: {
        ['pagination.count_total']: true,
        ['pagination.key']: nextKey ? nextKey : '',
      },
    });

    const rewardsApi = this.http.get(`${this.lcd}/cosmos/distribution/v1beta1/delegators/${address}/rewards`);

    return api.pipe(
      expand((data) =>
        data.pagination.next_key ? this.getDelegations(address, `${data.pagination.next_key}`) : EMPTY,
      ),
      reduce((acc, val) => {
        return [...acc, ...val.delegation_responses];
      }, []),
      switchMap((delegations) => {
        return rewardsApi.pipe(
          map((items: any) => {
            const total = _.get(items, 'total[0]');
            const totalAmount = total?.denom === this.currencies.coinMinimalDenom ? total?.amount : 0;

            return {
              rewards: items,
              delegations,
              total: totalAmount,
            };
          }),
        );
      }),
    );
  }

  getUnbonding(address: string): Observable<any> {
    return this.http
      .get(`${this.lcd}/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`)
      .pipe(map((data: any) => data?.unbonding_responses));
  }

  getRedelegations(address: string): Observable<any> {
    return this.http.get(`${this.lcd}/cosmos/staking/v1beta1/delegators/${address}/redelegations`);
  }

  getAccount(address: string): Observable<any> {
    return this.http.get(`${this.lcd}/cosmos/auth/v1beta1/accounts/${address}`).pipe(
      catchError((error) => {
        return of(null);
      }),
    );
  }

  getCommission(operatorAddress: string): Observable<any> {
    return this.http.get(`${this.lcd}/cosmos/distribution/v1beta1/validators/${operatorAddress}/commission`).pipe(
      map((data: any) => {
        return _.get(data, 'commission.commission[0]');
      }),
    );
  }
}
