import { wallets as _coin98wallets } from '@cosmos-kit/coin98';
import { wallets as _keplrWallets } from '@cosmos-kit/keplr';
import { wallets as _leapWallets } from '@cosmos-kit/leap';
import { wallets as _coin98WalletMobile } from './coin98-mobile';
import { LOGO_COIN98, LOGO_LEAP_METAMASK } from './constant';
import { wallets as _wcWallets } from './wallet-connect/wc';

const coin98wallets = [..._coin98wallets, ..._coin98WalletMobile];
coin98wallets.forEach((wallet) => {
  if (wallet.walletInfo) {
    wallet.walletInfo.logo = LOGO_COIN98;

    // Change prettyName mobile
    wallet.walletInfo.prettyName = 'Coin98';
  }
});

const leapWallets = _leapWallets;
leapWallets.forEach((wallet) => {
  if (wallet?.walletInfo) {
    if (wallet.walletInfo.extends === 'MetaMask') {
      wallet.walletInfo.logo = LOGO_LEAP_METAMASK;
    } else {
      // Change prettyName mobile
      wallet.walletInfo.prettyName = 'Leap';
    }
  }
});

const keplrWallets = _keplrWallets;
keplrWallets.forEach((wallet) => {
  if (wallet.walletInfo) {
    // Change prettyName mobile
    wallet.walletInfo.prettyName = 'Keplr';
  }
});

const wcWallets = _wcWallets;

export { coin98wallets, keplrWallets, leapWallets, wcWallets };
