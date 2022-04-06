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
  Available = '#9C6CFF',
  DelegatableVesting = '#783296',
  Delegated = '#573655',
  Unbonding = '#9C96C8',
  StakingReward = '#574D56',
  Commission = '#96648C',
}