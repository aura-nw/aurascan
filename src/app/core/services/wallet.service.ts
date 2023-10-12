import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { StdSignDoc, makeSignDoc } from '@cosmjs/amino';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { Decimal } from '@cosmjs/math';
import { ChainInfo, Keplr, Key } from '@keplr-wallet/types';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AccountResponse, Coin98Client } from 'src/app/core/utils/coin98-client';
import { messageCreators } from 'src/app/core/utils/signing/messages';
import { createSignBroadcast, getNetworkFee } from 'src/app/core/utils/signing/transaction-manager';
import { LAST_USED_PROVIDER, WALLET_PROVIDER } from '../constants/wallet.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { WalletStorage } from '../models/wallet';
import { getKeplr, handleErrors } from '../utils/keplr';
import local from '../utils/storage/local';
import { NgxToastrService } from './ngx-toastr.service';

export type WalletKey = Partial<Key> | AccountResponse;

@Injectable({
  providedIn: 'root',
})
export class WalletService implements OnDestroy {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  chainId = this.environmentService.configValue.chainId;
  chainInfo = this.environmentService.configValue.chain_info;
  graphUrl = `${
    this.environmentService.configValue.horoscopeUrl + this.environmentService.configValue.horoscopePathGraphql
  }`;

  coin98Client: Coin98Client;
  destroyed$ = new Subject<void>();
  wallet$: Observable<WalletKey>;

  private _wallet$: BehaviorSubject<WalletKey>;

  get wallet(): WalletKey {
    return this._wallet$.getValue();
  }

  setWallet(nextState: WalletKey): void {
    this._wallet$.next(nextState);
  }

  dialogState$: Observable<'open' | 'close'>;
  private _dialogState$: BehaviorSubject<'open' | 'close'>;

  get dialogState(): 'open' | 'close' {
    return this._dialogState$.getValue();
  }

  setDialogState(nextState: 'open' | 'close'): void {
    this._dialogState$.next(nextState);
  }

  isMobileMatched = false;
  breakpoint$ = this.breakpointObserver
    .observe([Breakpoints.Small, Breakpoints.XSmall])
    .pipe(takeUntil(this.destroyed$));

  constructor(
    private environmentService: EnvironmentService,
    private toastr: NgxToastrService,
    private breakpointObserver: BreakpointObserver,
    private http: HttpClient,
    public translate: TranslateService,
  ) {
    this.breakpoint$.subscribe((state) => {
      if (state) {
        this.isMobileMatched = state.matches;
      }
    });

    this._dialogState$ = new BehaviorSubject(null);
    this.dialogState$ = this._dialogState$.asObservable();
    this._wallet$ = new BehaviorSubject(null);
    this.wallet$ = this._wallet$.asObservable();

    const lastProvider = local.getItem<WalletStorage>(LAST_USED_PROVIDER);
    const currentTimestamp = moment().subtract(1, 'd').toDate().getTime();

    if (lastProvider && currentTimestamp < lastProvider?.timestamp) {
      const { provider } = lastProvider;
      this.connect(provider);
    } else if (currentTimestamp > lastProvider?.timestamp) {
      local.removeItem(LAST_USED_PROVIDER);
    }

    window.addEventListener('keplr_keystorechange', () => {
      const lastProvider = local.getItem<WalletStorage>(LAST_USED_PROVIDER);

      if (lastProvider) {
        this.connect(lastProvider.provider);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    window.removeAllListeners('keplr_keystorechange');
  }

  mobileConnect(): Promise<any> {
    if (!this.coin98Client) {
      this.coin98Client = new Coin98Client(this.chainInfo);
    }
    return this.coin98Client
      .connect()
      .then((id) => id && this.coin98Client.getAccount())
      .then((account) => {
        if (account) {
          this.setWallet(account);
          return true;
        }
        return undefined;
      })
      .catch((err) => {
        this.catchErrors(err, true);
        return { errors: err };
      });
  }

  connect(provider: WALLET_PROVIDER): Promise<boolean> {
    switch (provider) {
      case WALLET_PROVIDER.KEPLR:
        this.connectKeplr(this.chainInfo);

        return Promise.resolve(true);

      case WALLET_PROVIDER.COIN98:
        const _coin98 = this.checkExistedCoin98();

        if (_coin98) {
          this.connectCoin98(this.chainInfo);
          return Promise.resolve(true);
        } else {
          if (this.isMobileMatched) {
            return this.mobileConnect();
            // return Promise.resolve(true);
          }
          return Promise.resolve(false);
        }
    }
  }

  disconnect(): void {
    this.setWallet(null);
    local.removeItem(LAST_USED_PROVIDER);
  }

  private async connectKeplr(chainInfo: ChainInfo): Promise<void> {
    const checkWallet = async () => {
      try {
        const keplr = await getKeplr();

        if (keplr) {
          // await keplrSuggestChain(chainInfo);
          await this.suggestChain(keplr);
          await keplr.enable(chainInfo.chainId);
          const account = await keplr.getKey(chainInfo.chainId);

          if (account) {
            this.setWallet(account);
            const timestamp = new Date().getTime();
            local.setItem<WalletStorage>(LAST_USED_PROVIDER, {
              provider: WALLET_PROVIDER.KEPLR,
              chainId: chainInfo.chainId,
              timestamp,
            });
          }
        } else {
          this.disconnect();
          window.open('https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en');
        }
      } catch (e: any) {
        this.catchErrors(e);
      }
    };
    checkWallet();
  }

  private async connectCoin98(chainInfo: ChainInfo): Promise<void> {
    const coin98 = await this.checkExistedCoin98();

    if (coin98) {
      try {
        // await keplrSuggestChain(chainInfo);
        await this.suggestChain(coin98);
        await coin98.enable(chainInfo.chainId);

        const account = await coin98.getKey(chainInfo.chainId);

        if (account) {
          this.setWallet(account);
          const timestamp = new Date().getTime();
          local.setItem<WalletStorage>(LAST_USED_PROVIDER, {
            provider: WALLET_PROVIDER.KEPLR,
            chainId: chainInfo.chainId,
            timestamp,
          });
        }
      } catch (e: any) {
        this.catchErrors(e);
        this.disconnect();
      }
    } else {
      this.disconnect();
      window.open('https://chrome.google.com/webstore/detail/coin98-wallet/aeachknmefphepccionboohckonoeemg');
    }
  }

  checkExistedCoin98(): Keplr | null | undefined {
    if (window?.coin98) {
      if (window.coin98.keplr) {
        return window.coin98.keplr;
      } else {
        return undefined; // c98 not override keplr
      }
    }

    return null; // not found coin98
  }

  getAccount(): WalletKey {
    const account = this.wallet;

    if (account) {
      return account;
    }

    this.setDialogState('open');

    return null;
  }

  async catchErrors(e, isMobileDevice = false) {
    handleErrors(e).then((msg) => {
      if (msg) {
        this.toastr.error(isMobileDevice ? JSON.stringify(msg || '') : msg);
      }
    });
  }

  async signAndBroadcast(
    {
      messageType,
      message,
      senderAddress,
      network,
      signingType,
      chainId,
    }: { messageType: any; message: any; senderAddress: any; network: ChainInfo; signingType: any; chainId: any },
    validatorsCount?: number,
  ) {
    let signingClient;
    if (this.isMobileMatched && !this.checkExistedCoin98()) {
      const msgs = messageCreators[messageType](senderAddress, message, network);
      let fee;
      if (this.coin98Client) {
        fee = this.coin98Client.getGasEstimateMobile(network, messageType, validatorsCount);
      } else {
        fee = await getNetworkFee(network, senderAddress, msgs, '');
      }

      return this.makeSignDocData(senderAddress, {
        msgs,
        chain_id: chainId,
        fee: fee,
        memo: '',
      })
        .toPromise()
        .then((signDoc) => {
          return this.coin98Client.signAndBroadcast(senderAddress, signDoc).then((e) => {
            let error;
            if (e.result?.error) {
              const temp = JSON.stringify(e.result?.error) || null;
              const charAt = temp?.indexOf('code') + 5;
              error = temp?.slice(charAt, charAt + 2) || JSON.stringify(e.result?.error) || null;
            }

            return {
              hash: e?.result?.transactionHash || null,
              error,
            };
          });
        })
        .catch((error) => {
          this.catchErrors(error, true);
          return {
            hash: null,
            error,
          };
        });
    }

    return createSignBroadcast(
      {
        messageType,
        message,
        senderAddress,
        network,
        signingType,
        chainId,
      },
      validatorsCount || undefined,
      signingClient,
    );
  }

  private makeSignDocData(address, signDoc: Partial<StdSignDoc>): Observable<StdSignDoc> {
    const envDB = this.environmentService.configValue.horoscopeSelectedChain;
    const operationsDoc = `
    query getAccountInfo ($address: String) {
      ${envDB} {
        account (where: {address: {_eq: $address}}) {
          account_number
          sequence
          type
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          address,
        },
        operationName: 'getAccountInfo',
      })
      .pipe(
        map((res) => {
          if (!res?.data[envDB].account[0]) {
            throw new Error('Can not get Account');
          }
          const accountAuth: {
            account_number: number | string;
            sequence: number | string;
          } = res?.data[envDB].account[0];

          if (accountAuth) {
            return makeSignDoc(
              signDoc.msgs,
              signDoc.fee,
              signDoc.chain_id,
              signDoc.memo,
              accountAuth.account_number,
              accountAuth.sequence || 0,
            );
          }
          throw new Error('Can not get Account');
        }),
      );
  }

  signMessage(base64String: string) {
    return this.coin98Client.signArbitrary(this.wallet.bech32Address, base64String);
  }

  async execute(userAddress, contract_address, msg, feeGas = null) {
    let signer;
    let gasStep = this.chainInfo?.gasPriceStep?.average || 0.0025;

    //convert gasPrice to Decimal
    let pow = 1;
    while (!Number.isInteger(gasStep)) {
      gasStep = gasStep * Math.pow(10, pow);
      pow++;
    }

    const fee = {
      gasPrice: {
        amount: Decimal.fromAtomics(gasStep.toString(), pow),
        denom: this.chainInfo.currencies[0].coinMinimalDenom,
      },
    };

    let fund = [];
    const key = Object.keys(msg)[0];
    if (msg[key]?.fund) {
      fund = JSON.parse(msg[key]?.fund);
      delete msg[key]?.fund;
    }

    if (this.isMobileMatched && !this.checkExistedCoin98()) {
      return this.coin98Client.execute(userAddress, contract_address, msg, '', undefined, fee, undefined);
    } else {
      signer = await window.getOfflineSignerAuto(this.chainId);
    }

    return SigningCosmWasmClient.connectWithSigner(this.chainInfo.rpc, signer, fee).then((client) =>
      client.execute(userAddress, contract_address, msg, feeGas || 'auto', '', fund || []),
    );
  }

  suggestChain(w: Keplr) {
    return w.experimentalSuggestChain(this.chainInfo);
  }

  async getWalletSign(minter, message) {
    let dataWallet;
    if (this.isMobileMatched && !this.checkExistedCoin98()) {
      let coin98Client = new Coin98Client(this.chainInfo);
      let temp = await coin98Client.signArbitrary(minter, message);
      dataWallet = temp['result'];
    } else {
      const keplr = await getKeplr();
      dataWallet = await keplr.signArbitrary(this.chainInfo.chainId, minter, message);
    }
    return dataWallet;
  }
}
