import { Injectable, OnDestroy } from '@angular/core';
import { Chain } from '@chain-registry/types';
import { JsonObject } from '@cosmjs/cosmwasm-stargate';
import { EncodeObject } from '@cosmjs/proto-signing';
import { Coin, StdFee } from '@cosmjs/stargate';
import {
  Actions,
  ChainWalletBase,
  CosmosClientType,
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
  private _logger: Logger;
  private _walletManager: WalletManager | null = null;
  private _chain: Chain;

  private testnets = ['aura-testnet-2', 'serenity-testnet-001'];

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
    return this._walletManager.isMobile;
  }

  get connectedChain() {
    return this._chain;
  }

  constructor() {
    this._walletAccountSubject$ = new BehaviorSubject<WalletAccount>(null);
    this.walletAccount$ = this._walletAccountSubject$.asObservable();
  }

  ngOnDestroy(): void {
    this._walletManager?.onUnmounted();

    this._walletManager.off('refresh_connection', () => {
      this.walletAccount = undefined;
    });
  }

  private _getSigningStargateClient() {
    return this.getChainWallet().getSigningStargateClient();
  }

  private _getSigningCosmWasmClient() {
    return this.getChainWallet().getSigningCosmWasmClient();
  }

  setWalletAction(config: Actions) {
    try {
      this._walletManager?.setActions(config);
      this._walletManager?.getWalletRepo(this._chain.chain_name)?.setActions(config);
    } catch (error) {
      console.error(error);
    }
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

    this._chain = chain;

    this._logger = new Logger(this.testnets.includes(chain.chain_id) ? 'DEBUG' : 'INFO');
    this._logger.info('Connect to chain: ', {
      pretty_name: chain.pretty_name,
      chain_id: chain.chain_id,
    });

    this._walletManager = new WalletManager(
      [chain],
      wallets,
      this._logger,
      throwErrors,
      subscribeConnectEvents,
      disableIframe,
      allAssets,
      undefined, // defaultNameService
      walletConnectOptions,
      signerOptions,
      endpointOptions,
      sessionOptions,
    );

    await this._walletManager.onMounted();

    this.accountChangeEvent();
  }

  get wallets() {
    return this._walletManager?.mainWallets || [];
  }

  disconnect() {
    this.getChainWallet()
      ?.disconnect(true, { walletconnect: { removeAllPairings: true } })
      .then(() => {
        this.walletAccount = null;
      });
  }

  getWalletRepo() {
    return this._walletManager.getWalletRepo(this._chain.chain_name);
  }

  connect(
    wallet: Wallet | WalletName,
    callback?: {
      success?: () => void;
      error?: (error) => void;
    },
  ) {
    const currentChainWallet = this.getChainWallet(typeof wallet == 'string' ? wallet : wallet.name);

    if (currentChainWallet?.isWalletNotExist) {
      window.open(currentChainWallet.downloadInfo?.link, '_blank');
      callback?.error?.(currentChainWallet.message);
      return undefined;
    }

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
        this._walletManager.getWalletRepo(this._chain.chain_name).disconnect();
        callback?.error?.(e);
      });

    return currentChainWallet;
  }

  restoreAccounts() {
    const account = this.getChainWallet()?.data as WalletAccount;
    if (account) {
      this._logger.info('Restore accounts: ', account);
      this.walletAccount = account;
    }
  }

  accountChangeEvent() {
    this._walletManager.on('refresh_connection', () => {
      this.getChainWallet()
        ?.client?.getAccount(this._chain.chain_id)
        .then((account) => {
          if (this.walletAccount && account.address != this.walletAccount.address) {
            this.walletAccount = account;
          }
        });
    });
  }

  getChainWallet(walletName?: WalletName): ChainWalletBase {
    let _walletName = walletName ?? localStorage.getItem(STORAGE_KEY.CURRENT_WALLET);
    if (!_walletName) {
      return null;
    }

    const wallet = this._walletManager.getChainWallet(this._chain.chain_name, _walletName);

    !wallet?.isActive && wallet?.activate();

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
    return this.getChainWallet()?.client?.signArbitrary(this._chain.chain_id, signer, data);
  }

  getAccount() {
    const account = this.walletAccount;

    if (account) {
      return account;
    }

    const repo = this._walletManager.getWalletRepo(this._chain?.chain_name);

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

  estimateFee(messages: EncodeObject[], type?: CosmosClientType, memo?: string, multiplier?: number) {
    return this.getChainWallet().estimateFee(messages, type, memo, multiplier);
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
