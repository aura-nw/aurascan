import { Injectable, OnDestroy } from '@angular/core';
import { Chain } from '@chain-registry/types';
import {
  ChainWalletBase,
  EndpointOptions,
  Logger,
  MainWalletBase,
  SessionOptions,
  SignerOptions,
  Wallet,
  WalletAccount,
  WalletConnectOptions,
  WalletManager,
  WalletName,
} from '@cosmos-kit/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { allAssets, STORAGE_KEY } from '../utils/cosmoskit';

@Injectable({
  providedIn: 'root',
})
export class WalletsService implements OnDestroy {
  // wallet config
  logger = new Logger('DEBUG');
  walletManager: WalletManager | null = null;
  chain: Chain;

  // account subject config
  walletAccountSubject$: BehaviorSubject<WalletAccount>;
  walletAccount$: Observable<WalletAccount>;

  set walletAccount(walletAccount: WalletAccount) {
    this.walletAccountSubject$.next(walletAccount);
  }

  get walletAccount() {
    return this.walletAccountSubject$.getValue();
  }

  constructor() {
    this.walletAccountSubject$ = new BehaviorSubject<WalletAccount>(null);
    this.walletAccount$ = this.walletAccountSubject$.asObservable();
  }

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

    const assetLists = allAssets.filter((asset) => (asset.chain_name = chain.chain_name));

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

  get wallets() {
    return this.walletManager?.mainWallets || [];
  }

  disconnect() {
    const walletName = localStorage.getItem(STORAGE_KEY.CURRENT_WALLET);

    this.getChainWallet(walletName)
      ?.disconnect(true, { walletconnect: { removeAllPairings: true } })
      .then(() => {
        this.walletAccount = null;
      });
  }

  connect(
    wallet: Wallet | WalletName,
    callback?: {
      success?: () => void;
      error?: (error) => void;
    },
  ) {
    const currentChainWallet = this.getChainWallet(typeof wallet == 'string' ? wallet : wallet.name);

    currentChainWallet
      ?.connect(true)
      .then(() => {
        return currentChainWallet.client.getAccount(currentChainWallet.chainId);
      })
      .then((account) => {
        this.walletAccount = account;
        callback?.success?.();
      })
      .catch((e) => {
        callback?.error?.(e);
      });

    return currentChainWallet;
  }

  async restoreAccounts() {
    const walletName = localStorage.getItem('cosmos-kit@2:core//current-wallet');

    if (walletName) {
      this.connect(walletName);
    }
  }

  getChainWallet(walletName: WalletName): ChainWalletBase {
    if (!walletName) {
      return null;
    }

    const wallet = this.walletManager.getChainWallet(this.chain.chain_name, walletName);

    wallet.activate();

    return wallet;
  }

  signAndBroadcast(payload: any, ...payl) {
    return null;
  }

  execute(...a) {
    return null;
  }

  getWalletSign(...param) {
    return null;
  }

  getAccount() {
    // const account = this.wallet;
    // if (account) {
    //   return account;
    // }
    // this.openWalletPopup();
    // return null;
  }
}
