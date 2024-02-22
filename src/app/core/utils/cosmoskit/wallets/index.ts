import { wallets as coin98Wallets } from '@cosmos-kit/coin98';
import { MainWalletBase } from '@cosmos-kit/core';
import { WalletName } from '@cosmos-kit/core/cjs/types';
import { wallets as keplrWallets } from '@cosmos-kit/keplr-extension';
import { wallets as keplrMobileWallets } from '@cosmos-kit/keplr-mobile';
import { wallets as leapWallets } from '@cosmos-kit/leap-extension';
import { wallets as leapMobileWallets } from '@cosmos-kit/leap-mobile';
import { LOGO_COIN98, LOGO_LEAP_METAMASK } from '../constant';
import {
  isCoin98Browser,
  isCoin98Existed,
  isKeplrBrowser,
  isKeplrExisted,
  isLeapBrowser,
  isLeapExisted,
  isMetamaskExisted,
} from '../helpers/browser';
import { wallets as coin98MobileWallets } from './coin98-mobile';
import { wallets as leapSnapMetaMaskWallets } from './leap-metamask-cosmos-snap';
import { wallets as wcWallets } from './wallet-connect/wc';

leapSnapMetaMaskWallets.forEach((lsw) => {
  lsw.walletInfo.logo = LOGO_LEAP_METAMASK;
});

coin98Wallets.forEach((lsw) => {
  lsw.walletInfo.logo = LOGO_COIN98;
});

coin98MobileWallets.forEach((lsw) => {
  lsw.walletInfo.logo = LOGO_COIN98;
  lsw.walletInfo.prettyName = 'Coin98';
});

leapMobileWallets.forEach((lsw) => {
  lsw.walletInfo.prettyName = 'Leap';
});

keplrMobileWallets.forEach((lsw) => {
  lsw.walletInfo.prettyName = 'Keplr';
});

const mobileWallets = [
  ...(isCoin98Browser() ? coin98Wallets : coin98MobileWallets),
  ...(isLeapBrowser() ? leapWallets : leapMobileWallets),
  ...(isKeplrBrowser() ? keplrWallets : keplrMobileWallets),
] as MainWalletBase[];

const desktopWallets = [
  ...coin98Wallets,
  ...keplrWallets,
  ...leapWallets,
  ...leapSnapMetaMaskWallets,
] as MainWalletBase[];

function checkDesktopWallets(walletName: WalletName) {
  switch (walletName) {
    case coin98Wallets[0].walletName:
      return isCoin98Existed();
    case keplrWallets[0].walletName:
      return isKeplrExisted();
    case leapWallets[0].walletName:
      return isLeapExisted();
    case leapSnapMetaMaskWallets[0].walletName:
      return isMetamaskExisted();

    default:
      return true;
  }
}

export { desktopWallets, mobileWallets, wcWallets, checkDesktopWallets };
