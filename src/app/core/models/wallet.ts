import { WALLET_PROVIDER } from "../constants/wallet.constant";

export interface WalletInfo {
  name: string;
  icon: string;
}
export type WalletStorage = {
  provider: WALLET_PROVIDER;
  chainId: string;
};
export interface Balances {
  balance: string;
  delegated: number;
  unbonding: number;
  stake_reward: number;
  address: string;
}
