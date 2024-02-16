import { wallets as coin98Wallets } from '@cosmos-kit/coin98';
import { MainWalletBase } from '@cosmos-kit/core';
import { wallets as keplrWallets } from '@cosmos-kit/keplr-extension';
import { wallets as leapWallets } from '@cosmos-kit/leap-extension';
import { wallets as leapSnapMetaMaskWallets } from '@cosmos-kit/leap-metamask-cosmos-snap';
import { wallets as leapMobileWallets } from '@cosmos-kit/leap-mobile';
import { LOGO_COIN98, LOGO_LEAP_METAMASK } from '../constant';
import { isCoin98Browser, isLeapBrowser } from '../helpers/browser';
import { wallets as coin98MobileWallets } from './coin98-mobile';
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

const mobileWallets = [
  ...(isCoin98Browser() ? coin98Wallets : coin98MobileWallets),
  ...(isLeapBrowser() ? leapWallets : leapMobileWallets),
] as MainWalletBase[];

const desktopWallets = [
  ...coin98Wallets,
  ...keplrWallets,
  ...leapWallets,
  ...leapSnapMetaMaskWallets,
] as MainWalletBase[];

export { desktopWallets, mobileWallets, wcWallets };
