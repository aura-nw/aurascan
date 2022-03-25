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