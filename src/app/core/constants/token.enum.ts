export enum TokenTab {
  Transfers = 'transfers',
  Holders = 'holders',
  Info = 'info',
  Contract = 'contract',
  Analytics = 'analytics',
  Inventory = 'inventory',
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
  ReadContractProxy = 'readProxy',
  WriteContractProxy = 'writeProxy',
}

export enum TokenType {
  Token = 'Token',
  NFT = 'NFT',
}

export enum ABTActionType {
  Reject = 'Reject this ABT',
  RejectAll = 'Reject all ABTs from this Creator',
}

export enum EModeToken {
  Native = 'Native',
  IBCCoin = 'IBC Token',
  CWToken = 'CW20 Token',
}

export enum EModeEvmToken {
  ERCToken = 'ERC20 Token',
}
