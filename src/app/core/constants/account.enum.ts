/**
 * PageEventType
 */
export enum PageEventType {
  Delegation = 'Delegation',
  Unbonding = 'Unbonding',
  Redelegation = 'Redelegation',
  Vestings = 'Vestings',
  Token = 'Token'
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
  DelegatableVesting = 'Delegatable Vesting',
  Delegated = 'Delegated',
  Unbonding = 'Unbonding',
  StakingReward = 'Staking Reward',
  Commission = 'Commission',
}

export enum WalletAcount {
  Available = '#348073',
  DelegatableVesting = '#49B3A1',
  Delegated = '#5EE6D0',
  Unbonding = '#7AF3E0',
  StakingReward = '#AAF8EB',
  Commission = '#C6F8F0',
}
