import { EndpointOptions, Wallet } from '@cosmos-kit/core';
import { WCWallet } from '@cosmos-kit/walletconnect';

import { ChainWalletConnect } from './chain-wallet';
import { WalletConnectClient } from './client';

export class WalletConnectWallet extends WCWallet {
  constructor(
    walletInfo: Wallet,
    preferredEndpoints?: EndpointOptions['endpoints']
  ) {
    super(walletInfo, ChainWalletConnect, WalletConnectClient);
    this.preferredEndpoints = preferredEndpoints;
  }
}
