import { preferredEndpoints } from './config';
import { WalletConnectWallet, walletConnectInfo } from './wallet-connect';

const wc = new WalletConnectWallet(walletConnectInfo, preferredEndpoints);

export const wallets = [wc];
