import {
  ACCOUNT_TYPE_ENUM,
  ACCOUNT_WALLET_COLOR_ENUM,
  TabsAccount,
  TabsAccountLink,
  TypeAccount,
  WalletAcount
} from './account.enum';

export const TYPE_ACCOUNT = [
  { label: ACCOUNT_TYPE_ENUM.All, value: TypeAccount.All },
  { label: ACCOUNT_TYPE_ENUM.NativeCoin, value: TypeAccount.NativeCoin },
  // { label: ACCOUNT_TYPE_ENUM.IBCCoin, value: TypeAccount.IBCCoin },
  // { label: ACCOUNT_TYPE_ENUM.AuthedIBCCoin, value: TypeAccount.AuthedIBCCoin },
  // { label: ACCOUNT_TYPE_ENUM.PoolCoin, value: TypeAccount.PoolCoin },
  // { label: ACCOUNT_TYPE_ENUM.MajorPoolCoin, value: TypeAccount.MajorPoolCoin }
];

export const ACCOUNT_WALLET_COLOR = [
  { name: ACCOUNT_WALLET_COLOR_ENUM.Available, color: WalletAcount.Available, amount: '0.000000' },
  { name: ACCOUNT_WALLET_COLOR_ENUM.DelegableVesting, color: WalletAcount.DelegableVesting, amount: '0.000000' },
  { name: ACCOUNT_WALLET_COLOR_ENUM.Delegated, color: WalletAcount.Delegated, amount: '0.000000' },
  { name: ACCOUNT_WALLET_COLOR_ENUM.Unbonding, color: WalletAcount.Unbonding, amount: '0.000000' },
  { name: ACCOUNT_WALLET_COLOR_ENUM.StakingReward, color: WalletAcount.StakingReward, amount: '0.000000' },
];

export const TABS_TITLE_ACCOUNT = [
  { label: TabsAccount.ExecutedTxs, value: TabsAccountLink.ExecutedTxs },
  { label: TabsAccount.EVMExecutedTxs, value: TabsAccountLink.EVMExecutedTxs },
  { label: TabsAccount.NativeTxs, value: TabsAccountLink.NativeTxs },
  { label: TabsAccount.FtsTxs, value: TabsAccountLink.FtsTxs },
  { label: TabsAccount.NftTxs, value: TabsAccountLink.NftTxs },
];

export const COSMOS_ACCOUNT_MESSAGE_TYPE = "/cosmos.auth.v1beta1.BaseAccount";