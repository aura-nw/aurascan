import { EndpointOptions, Wallet } from '@cosmos-kit/core';
import { WCWallet } from '@cosmos-kit/walletconnect';

import { ChainCoin98Mobile } from './chain-wallet';
import { Coin98Client } from './client';

export class Coin98MobileWallet extends WCWallet {
  constructor(
    walletInfo: Wallet,
    preferredEndpoints?: EndpointOptions['endpoints']
  ) {
    super(walletInfo, ChainCoin98Mobile, Coin98Client);
    this.preferredEndpoints = preferredEndpoints;
  }
}
