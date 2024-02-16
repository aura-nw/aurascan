import { Injectable, OnDestroy } from '@angular/core';
import { Chain } from '@chain-registry/types';
import { JsonObject } from '@cosmjs/cosmwasm-stargate';
import { EncodeObject } from '@cosmjs/proto-signing';
import { Coin, StdFee } from '@cosmjs/stargate';
import {
  Actions,
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
export class WalletService implements OnDestroy {
  // wallet config
  private logger = new Logger('DEBUG');
  private walletManager: WalletManager | null = null;
  private chain: Chain;

  // account subject config
  private _walletAccountSubject$: BehaviorSubject<WalletAccount>;
  walletAccount$: Observable<WalletAccount>;

  set walletAccount(walletAccount: WalletAccount) {
    this._walletAccountSubject$.next(walletAccount);
  }

  get walletAccount() {
    return this._walletAccountSubject$.getValue();
  }

  get isMobile() {
    return this.walletManager.isMobile;
  }

  constructor() {
    this._walletAccountSubject$ = new BehaviorSubject<WalletAccount>(null);
    this.walletAccount$ = this._walletAccountSubject$.asObservable();
  }

  ngOnDestroy(): void {
    this.walletManager?.onUnmounted();
  }

  private _getSigningStargateClient() {
    return this.getChainWallet().getSigningStargateClient();
  }

  private _getSigningCosmWasmClient() {
    return this.getChainWallet().getSigningCosmWasmClient();
  }

  setWalletAction(config: Actions) {
    this.walletManager?.setActions(config);
    this.walletManager?.getWalletRepo(this.chain.chain_id)?.setActions(config);
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
    this.getChainWallet()
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
    const walletName = localStorage.getItem(STORAGE_KEY.CURRENT_WALLET);

    if (walletName) {
      this.connect(walletName);
    }
  }

  getChainWallet(walletName?: WalletName): ChainWalletBase {
    let _walletName = walletName ?? localStorage.getItem(STORAGE_KEY.CURRENT_WALLET);
    if (!_walletName) {
      return null;
    }

    const wallet = this.walletManager.getChainWallet(this.chain.chain_name, _walletName);

    !wallet.isActive && wallet.activate();

    return wallet;
  }

  async signAndBroadcast(
    signerAddress: string,
    messages: EncodeObject[],
    fee: StdFee | number | 'auto' = 'auto',
    memo?: string,
    timeoutHeight?: bigint,
  ) {
    return (await this._getSigningCosmWasmClient()).signAndBroadcast(signerAddress, messages, fee, memo, timeoutHeight);
  }

  executeContract(
    senderAddress: string,
    contractAddress: string,
    msg: JsonObject,
    fee: StdFee | 'auto' | number = 'auto',
    memo?: string,
    funds?: readonly Coin[],
  ) {
    return this._getSigningCosmWasmClient().then(
      (client) => client?.execute(senderAddress, contractAddress, msg, fee, memo, funds),
    );
  }

  signArbitrary(signer: string, data: string | Uint8Array) {
    return this.getChainWallet()?.client?.signArbitrary(this.chain.chain_id, signer, data);
  }

  getAccount() {
    const account = this.walletAccount;

    if (account) {
      return account;
    }

    const repo = this.walletManager.getWalletRepo(this.chain?.chain_id);

    repo?.openView();
    return null;
  }

  async delegateTokens(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fee: StdFee | 'auto' | number = 'auto',
    memo?: string,
  ) {
    return this._getSigningCosmWasmClient().then((client) =>
      client.delegateTokens(delegatorAddress, validatorAddress, amount, fee, memo),
    );
  }

  async undelegateTokens(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fee: StdFee | 'auto' | number = 'auto',
    memo?: string,
  ) {
    return this._getSigningCosmWasmClient().then((client) =>
      client.undelegateTokens(delegatorAddress, validatorAddress, amount, fee, memo),
    );
  }

  signAndBroadcastStargate(
    signerAddress: string,
    messages: EncodeObject[],
    fee: StdFee | number | 'auto' = 'auto',
    memo?: string,
    timeoutHeight?: bigint,
  ) {
    return this._getSigningStargateClient().then((client) =>
      client.signAndBroadcast(signerAddress, messages, fee, memo, timeoutHeight),
    );
  }
}
