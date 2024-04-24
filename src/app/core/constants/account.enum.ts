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
  ExecutedTxs = 'Cosmos Executed Txn',
  EVMExecutedTxs = 'EVM Executed Txn',
  NativeTxs = 'Native/Ibc Transfer',
  FtsTxs = 'Fungible Token Transfer',
  NftTxs = 'NFT Transfer',
}

export enum TabsAccountLink {
  ExecutedTxs = 'executed',
  EVMExecutedTxs = 'evm-executed',
  NativeTxs = 'native-transfer',
  FtsTxs = 'fungible-token-transfer',
  NftTxs = 'nft-transfer',
}

export enum ETypeFtExport {
  CW20 = 'cw20-transfer',
  ERC20 = 'erc20-transfer'
}

export enum ExportFileName {
  ExecutedTxs = 'cosmos-executed',
  EVMExecutedTxs = 'evm-executed',
  NativeTxs = 'native-ibc-transfer',
  FtsTxs = 'fungible-token-transfer',
  NftTxs = 'nft-transfer',
}

export enum StakeModeAccount {
  Delegations = 0,
  Unbondings = 1,
  Redelegations = 2,
  Vestings = 3,
}

//
export enum EAccountType {
  BaseAccount = '/cosmos.auth.v1beta1.BaseAccount',
  PeriodicVestingAccount = 'cosmos-sdk/PeriodicVestingAccount',
  DelayedVestingAccount = 'cosmos-sdk/DelayedVestingAccount',
}

export enum AccountTxType {
  Sent = 'Sent',
  Received = 'Received',
}

export enum ENameTag {
  Normal = 'Normal',
  Public = 'Public',
  Private = 'Private',
}

export enum EScreen {
  Contract = 'Contract',
  Account = 'Account',
  WatchList = 'WatchList',
}
