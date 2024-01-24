import { Injectable, OnDestroy } from '@angular/core';
import { Chain } from '@chain-registry/types';
import {
  ChainWalletBase,
  EndpointOptions,
  Logger,
  MainWalletBase,
  SessionOptions,
  SignerOptions,
  WalletConnectOptions,
  WalletManager,
  WalletName,
} from '@cosmos-kit/core';
import { assets } from 'chain-registry';

@Injectable({
  providedIn: 'root',
})
export class WalletsService implements OnDestroy {
  logger = new Logger('DEBUG');
  walletManager: WalletManager | null = null;

  chain: Chain;

  get wallets() {
    return this.walletManager?.mainWallets || [];
  }

  constructor() {}

  ngOnDestroy(): void {
    this.walletManager?.onUnmounted();
  }

  async initWalletManager({
    chain,
    wallets,
    throwErrors,
    subscribeConnectEvents,
    walletConnectOptions,
    signerOptions,
    endpointOptions,
    sessionOptions,
    disableIframe,
  }: {
    chain: Chain;
    wallets: MainWalletBase[];
    throwErrors?: boolean;
    subscribeConnectEvents?: boolean;
    walletConnectOptions?: WalletConnectOptions;
    signerOptions?: SignerOptions;
    endpointOptions?: EndpointOptions;
    sessionOptions?: SessionOptions;
    disableIframe?: boolean;
  }) {
    if (!chain) {
      throw new Error('Chain is required');
    }

    this.chain = chain;

    const assetLists = assets.filter((asset) => (asset.chain_name = chain.chain_name));

    this.walletManager = new WalletManager(
      [chain],
      wallets,
      this.logger,
      throwErrors,
      subscribeConnectEvents,
      disableIframe,
      assetLists,
      undefined, // defaultNameService
      walletConnectOptions,
      signerOptions,
      endpointOptions,
      sessionOptions,
    );

    await this.walletManager.onMounted();
  }

  get state() {
    return this.walletManager.state;
  }

  getChainWallet(walletName: WalletName): ChainWalletBase {
    if (!walletName) {
      return null;
    }

    const wallet = this.walletManager.getChainWallet(this.chain.chain_name, walletName);

    wallet.activate();

    return wallet;
  }

  getMainWallet() {
    return this.walletManager.getMainWallet(this.chain.chain_name);
  }

  getWalletRepo() {
    return this.walletManager.getWalletRepo(this.chain.chain_name);
  }

  getChainRecord() {
    return this.walletManager.getChainRecord(this.chain.chain_name);
  }

  getChainLogo() {
    return this.walletManager.getChainLogo(this.chain.chain_name);
  }

  signWithWC(chainWallet) {
    return chainWallet.client.signArbitrary(this.chain.chain_id, chainWallet.address, 'Test message');
  }
}
