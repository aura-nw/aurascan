import { WALLET_PROVIDER } from "../constants/wallet.constant";

export interface IWalletInfo {
  name: string;
  icon: string;
}
export type WalletStorage = {
  provider: WALLET_PROVIDER;
  chainId: string;
};
export interface IBalances {
  balance: string;
  delegated: number;
  unbonding: number;
  stake_reward: number;
  address: string;
}

export interface IBalance {
  denom: string;
  amount: string;
}
export interface IPagination {
  next_key?: any;
  total: string;
}
export interface IBalances {
  balances: IBalance[];
  pagination: IPagination;
}



export interface IDelegation {
  delegator_address: string;
  validator_address: string;
  shares: string;
}

export interface IDelegationRespons {
  delegation: IDelegation;
  balance: IBalance;
}

export interface IDelegated {
  delegation_responses: IDelegationRespons[];
  pagination: IPagination;
}

export interface IUnbonding {
  unbonding_responses: any[];
  pagination: IPagination;
}

export interface IReward {
  validator_address: string;
  reward: IBalance[];
}

export interface IStakeReward {
  rewards: IReward[];
  total: IBalance[];
}

export interface IWalletDetail {
  balance: IBalances;
  delegated: IDelegated;
  unbonding: IUnbonding;
  stake_reward: IStakeReward;
  address: string;
}
