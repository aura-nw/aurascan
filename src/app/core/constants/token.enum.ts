export enum TokenTab {
  Transfers = 'transfers',
  Holders = 'holders',
  Info = 'info',
  Contract = 'contract',
  Analytics = 'analytics',
  Inventory = 'inventory'
}

export enum TokenContractType {
  ReadContract = 'read',
  WriteContract = 'write',
  ReadProxy = 'readProxy',
  WriteProxy = 'writeProxy',
}

export enum ContractType {
  Code = 'code',
  ReadContract = 'read',
  WriteContract = 'write',
}

export enum TokenType {
  Token = 'Token',
  NFT = 'NFT'
}

export enum ABTActionType {
  Reject = 'Reject this ABT',
  RejectAll = 'Reject all ABTs from this Creator'
}

export enum EModeToken {
  StakingCoin = 'Staking Coin',
  IBCCoin = 'IBC Token',
  CWToken = 'CW Token',
}