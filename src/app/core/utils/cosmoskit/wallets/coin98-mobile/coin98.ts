import { preferredEndpoints } from './config';
import { Coin98MobileWallet, coin98MobileInfo } from './wallet-connect';

const coin98Mobile = new Coin98MobileWallet(
  coin98MobileInfo,
  preferredEndpoints
);

export const wallets = [coin98Mobile];
