export enum ContractTab {
  Transactions = 'transactions',
  Cw20Token = 'cw20',
  Contract = 'contract',
  Events = 'events',
  Analytics = 'analytics',
}

export enum ContractVerifyType {
  Unverified = 'UNVERIFIED',
  Verified = 'SUCCESS',
  VerifiedFail = 'FAIL',
  Verifying = 'VERIFYING',
}

export enum ContractTransactionType {
  IN = 'IN',
  CREATION = 'CREATION',
  OUT = 'OUT',
}

export enum ContractRegisterType {
  CW20 = 'CW20',
  CW721 = 'CW721',
  CW4973 = 'CW4973',
}

export enum EvmContractRegisterType {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
}
