import { ACCOUNT_TYPE_ENUM, TypeAccount } from "./account.enum";

export const TYPE_ACCOUNT = [
  { label: ACCOUNT_TYPE_ENUM.All, value: TypeAccount.All },
  { label: ACCOUNT_TYPE_ENUM.NativeCoin, value: TypeAccount.NativeCoin },
  { label: ACCOUNT_TYPE_ENUM.IBCCoin, value: TypeAccount.IBCCoin },
  { label: ACCOUNT_TYPE_ENUM.AuthedIBCCoin, value: TypeAccount.AuthedIBCCoin },
  { label: ACCOUNT_TYPE_ENUM.PoolCoin, value: TypeAccount.PoolCoin },
  { label: ACCOUNT_TYPE_ENUM.MajorPoolCoin, value: TypeAccount.MajorPoolCoin }
]
