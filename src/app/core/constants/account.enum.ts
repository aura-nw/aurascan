/**
 * PageEventType
 */
export enum PageEventType {
  Delegation = 'Delegation',
  Unbonding = 'Unbonding',
  Redelegation = 'Redelegation',
  Vestings = 'Vestings',
  Token = 'Token',
}

export enum TypeAccount {
  All = 'All Assets',
  NativeCoin = 'Native Coins',
  IBCCoin = 'IBC Coins',
  AuthedIBCCoin = 'Authed IBC Coins',
  PoolCoin = 'Pool Coins',
  MajorPoolCoin = 'Major Pool Coins',
}

export enum ACCOUNT_TYPE_ENUM {
  All = '',
  NativeCoin = 'native',
  IBCCoin = 'ibc',
  AuthedIBCCoin = 'authedIbc',
  PoolCoin = 'poolCoin',
  MajorPoolCoin = 'majorPoolCoin',
}

export enum ACCOUNT_WALLET_COLOR_ENUM {
  Available = 'Available',
  DelegableVesting = 'Delegable Vesting',
  Delegated = 'Delegated',
  Unbonding = 'Unbonding',
  StakingReward = 'Staking Reward',
  Commission = 'Commission',
}

export enum WalletAcount {
  Available = '#5EE6D0',
  DelegableVesting = '#005F73',
  Delegated = '#E9D8A6',
  Unbonding = '#EE9B00',
  StakingReward = '#CA6702',
  Commission = '#9B2226',
}

export enum TabsAccount {
  Assets = 'ASSETS',
  Transactions = 'TRANSACTIONS',
  Stake = 'STAKE',
}

export enum StakeModeAccount {
  Delegations = 0,
  Unbondings = 1,
  Redelegations = 2,
  Vestings = 3,
}
export enum EAccountType {
  BaseAccount = 'cosmos-sdk/BaseAccount',
  PeriodicVestingAccount = 'cosmos-sdk/PeriodicVestingAccount',
  DelayedVestingAccount = 'cosmos-sdk/DelayedVestingAccount',
}
