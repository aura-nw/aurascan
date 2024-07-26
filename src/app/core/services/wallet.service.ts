import { Injectable, OnDestroy } from '@angular/core';
import { Chain } from '@chain-registry/types';
import { JsonObject, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
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
import { EnvironmentService } from '../data-services/environment.service';
import { IMultichainWalletAccount } from '../models/wallet';
import { convertEvmAddressToBech32Address, transferAddress } from '../utils/common/address-converter';
import { allAssets, STORAGE_KEY } from '../utils/cosmoskit';
import { getGasPriceByChain } from '../utils/cosmoskit/helpers/gas';
import { ExtendsWalletClient } from '../utils/cosmoskit/wallets';
import { wallets as leapMetamask } from '../utils/cosmoskit/wallets/leap-metamask-cosmos-snap';
import { getSigner } from '../utils/ethers/ethers';
import { addNetwork, checkNetwork, getMetamask } from '../utils/ethers/utils';
import local from '../utils/storage/local';

@Injectable({
  providedIn: 'root',
})
export class WalletService implements OnDestroy {
  // wallet config
  private _logger: Logger;
  private _walletManager: WalletManager | null = null;
  private _chain: Chain;

  private testnets = ['auradev_1235-3', 'auradev_1236-2'];

  // account subject config
  private _walletAccountSubject$: BehaviorSubject<IMultichainWalletAccount>;
  walletAccount$: Observable<IMultichainWalletAccount>;

  set walletAccount(walletAccount: IMultichainWalletAccount) {
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

  constructor(private env: EnvironmentService) {
    this._walletAccountSubject$ = new BehaviorSubject<IMultichainWalletAccount>(null);
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
    if (this._walletManager) {
      return 'EXISTED';
    }

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
    this.evmChangeEvent();
    return 'SUCCESS';
  }

  get wallets() {
    return this._walletManager?.mainWallets || [];
  }

  disconnect() {
    if (this.walletAccount.evmAccount) {
      this.walletAccount = null;

      local.removeItem(STORAGE_KEY.CURRENT_EVM_WALLET);

      return;
    }

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
        const address = this.parseAddress(account.address);
        this.walletAccount = {
          cosmosAccount: account,
          address: address.accountAddress,
          evmAddress: address.accountEvmAddress,
        };
        callback?.success?.();
      })
      .catch((e) => {
        this._walletManager.getWalletRepo(this._chain.chain_name).disconnect();
        callback?.error?.(e);
      });

    return currentChainWallet;
  }

  restoreEvmAccounts() {
    let account = local.getItem(STORAGE_KEY.CURRENT_EVM_WALLET);

    if (account) {
      this.connectEvmWallet().then().catch();
    }  
  }

  restoreAccounts() {
    const account = this.getChainWallet()?.data as WalletAccount;

    if (account) {
      this._logger.info('Restore accounts: ', account);
      this.walletAccount = {
        cosmosAccount: account,
        address: account.address,
      };
    } else {
      this.restoreEvmAccounts();
    }
  }

  accountChangeEvent() {
    this._walletManager.on('refresh_connection', () => {
      this.getChainWallet()
        ?.client?.getAccount(this._chain.chain_id)
        .then((account) => {
          if (this.walletAccount && account.address != this.walletAccount.address) {
            this.walletAccount = {
              cosmosAccount: account,
              address: account.address,
            };
          }
        });
    });
  }

  evmChangeEvent() {
    const reconnect = () => {
      const timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        this.connectToChain();
      }, 1000);
    };

    (window as any).ethereum?.on('accountsChanged', () => {
      this.connectEvmWallet(true).then().catch();
    });
    (window as any).ethereum?.on('chainChanged', reconnect);
  }

  private async _getSigningCosmWasmClientAuto() {
    let _walletName = localStorage.getItem(STORAGE_KEY.CURRENT_WALLET);
    const chainWallet = this._walletManager.getMainWallet(_walletName);

    if (_walletName == leapMetamask[0].walletName) {
      return undefined;
    }

    try {
      const client = chainWallet?.clientMutable?.data as ExtendsWalletClient;
      const signer = await client?.client?.getOfflineSignerAuto(this._chain.chain_id);

      return SigningCosmWasmClient.connectWithSigner(this.env.chainInfo.rpc, signer, {
        gasPrice: getGasPriceByChain(this._chain),
      });
    } catch (error) {
      console.log(`Error: ${error}`);

      return undefined;
    }
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
    let client;
    try {
      client = await this._getSigningCosmWasmClientAuto();
    } catch (error) {}

    if (!client) {
      client = await this._getSigningCosmWasmClient();
    }

    return client.signAndBroadcast(signerAddress, messages, fee, memo);
  }

  async executeContract(
    senderAddress: string,
    contractAddress: string,
    msg: JsonObject,
    fee: StdFee | 'auto' | number = 'auto',
    memo?: string,
    funds?: readonly Coin[],
  ) {
    let client;
    try {
      client = await this._getSigningCosmWasmClientAuto();
    } catch (error) {}

    if (!client) {
      client = await this._getSigningCosmWasmClient();
    }

    return client?.execute(senderAddress, contractAddress, msg, fee, memo, funds);
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

  getCosmosAccountOnly() {
    return this.walletAccount;
  }

  getEvmAccount() {
    const account = this.walletAccount;

    if (account?.evmAccount) {
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
    let client;
    try {
      client = await this._getSigningCosmWasmClientAuto();
    } catch (error) {}

    if (!client) {
      client = await this._getSigningCosmWasmClient();
    }

    return client.delegateTokens(delegatorAddress, validatorAddress, amount, fee, memo);
  }

  async undelegateTokens(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fee: StdFee | 'auto' | number = 'auto',
    memo?: string,
  ) {
    let client;
    try {
      client = await this._getSigningCosmWasmClientAuto();
    } catch (error) {}

    if (!client) {
      client = await this._getSigningCosmWasmClient();
    }

    return client.undelegateTokens(delegatorAddress, validatorAddress, amount, fee, memo);
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

  async connectEvmWallet(changedWallet = false) {
    const connected = await this.connectToChain();
    if (!changedWallet && !connected) {
      throw Error('Can not connect!');
    }

    getSigner(this.env.etherJsonRpc).then((signer) => {
      if (signer) {
        this.walletAccount = {
          evmAddress: signer.address,
          evmAccount: signer,
          address: convertEvmAddressToBech32Address(
            this.env.chainInfo.bech32Config.bech32PrefixAccAddr,
            signer.address,
          ),
        };

        local.setItem(STORAGE_KEY.CURRENT_EVM_WALLET, this.walletAccount);
      }
    });
  }

  async connectToChain() {
    const metamask = getMetamask();
    const chainId = '0x' + this.env.evmChainInfo.chainId.toString(16);
    try {
      await metamask.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId }],
      });
    } catch (switchError: any) {
      switch (switchError.code) {
        case 4902:
          // This error code indicates that the chain has not been added to MetaMask.
          await addNetwork(this.env.evmChainInfo);
          break;
        case 4001:
        // This error code : "User rejected the request."
        case -32002:
        // This error code : "Request of type 'wallet_switchEthereumChain' already pending"
        default:
          return false;
      }
    }

    return true;
  }

  parseAddress(address: string) {
    return transferAddress(this.env.chainInfo.bech32Config.bech32PrefixAccAddr, address);
  }
}

