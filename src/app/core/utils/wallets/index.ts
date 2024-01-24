import { wallets as _coin98wallets } from '@cosmos-kit/coin98';
import { wallets as _keplrWallets } from '@cosmos-kit/keplr';
import { wallets as _leapWallets } from '@cosmos-kit/leap';
import { LOGO_COIN98, LOGO_LEAP_METAMASK } from './constant';
import { wallets as _wcWallets } from './wallet-connect/wc';

const coin98wallets = _coin98wallets;
coin98wallets.forEach((wallet) => {
  wallet.walletInfo.logo = LOGO_COIN98;
});

const leapWallets = _leapWallets;
leapWallets.forEach((wallet) => {
  wallet.walletInfo.logo = wallet.walletInfo.extends === 'MetaMask' ? LOGO_LEAP_METAMASK : wallet.walletInfo.logo;
  wallet.walletInfo.prettyName = 'Leap';
});

const keplrWallets = _keplrWallets;
keplrWallets.forEach((wallet) => {
  wallet.walletInfo.prettyName = 'Keplr';
});

const wcWallets = _wcWallets;

export { coin98wallets, keplrWallets, leapWallets, wcWallets };
