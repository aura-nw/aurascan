export enum WALLET_PROVIDER {
  KEPLR = 'KEPLR',
  COIN98 = 'COIN98',
}

export const LAST_USED_PROVIDER = 'LAST_USED_PROVIDER';

export enum KEPLR_ERRORS {
  Success = 'OK',
  Failed = 'FAILED',
  NoChainInfo = 'THERE IS NO CHAIN INFO FOR',
  SameChain = 'SAME CHAIN IS ALREADY REGISTERED',
  NotRegistered = 'CHAIN IS NOT REGISTERED',
  RequestRejected = 'REQUEST REJECTED',
  NotInstall = 'NOT INSTALL',
  NOT_EXIST = "KEY DOESN'T EXIST",
}

export const SIGNING_MESSAGE_TYPES = {
  STAKE: 'Delegate', //`StakeTx`,
  RESTAKE: `Redelegate`,
  UNSTAKE: 'Undelegate', //`UnstakeTx`,
  VOTE: `Vote`,
  DEPOSIT: `DepositTx`,
  CLAIM_REWARDS: `GetReward`,
  WRITE_CONTRACT: `WriteContract`,
  UNKNOWN: `UnknownTx`,
  GRANT_BASIC_ALLOWANCE: 'GrantBasicAllowance',
  GRANT_PERIODIC_ALLOWANCE: 'GrantPeriodicAllowance',
  GRANT_MSG_ALLOWANCE: 'GrantMsgAllowance',
  REVOKE_ALLOWANCE: 'RevokeAllowance',
};

export enum ESigningType {
  Keplr = 'Keplr',
  Coin98 = 'Coin98',
}
