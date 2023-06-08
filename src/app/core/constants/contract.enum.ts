export enum ContractTab {
  Transactions = 'transactions',
  Cw20Token = 'cw20',
  Contract = 'contract',
  Events = 'events',
  Analytics = 'analytics',
}

export enum ContractVerifyType {
  Unverified = 'UNVERIFIED',
  Verified = 'VERIFIED',
  VerifiedFail = 'VERIFYFAIL',
  Verifying = 'VERIFYING'
}

export enum VerificationStatus { 
  FAIL = 'FAIL',
  VERIFYING = 'VERIFYING',
  SUCCESS = 'SUCCESS',
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
