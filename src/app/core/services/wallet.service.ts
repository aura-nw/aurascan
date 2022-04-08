import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Key } from '@keplr-wallet/types';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ChainsInfo, KEPLR_ERRORS, LAST_USED_PROVIDER, WALLET_PROVIDER } from '../constants/wallet.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { IResponsesTemplates as IResponsesTemplate } from '../models/common.model';
import { IWalletDetail, WalletStorage } from '../models/wallet';
import { getKeplr } from '../utils/keplr';
import session from '../utils/storage/session';
import { NgxToastrService } from './ngx-toastr.service';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  apiUrl = `${this.environmentService.apiUrl.value.cosmos}`;
  chainId = this.environmentService.apiUrl.value.chainId
  wallet$: Observable<Key>;
  private _wallet$: BehaviorSubject<Key>;

  get wallet(): Key {
    return this._wallet$.getValue();
  }

  setWallet(nextState: Key): void {
    this._wallet$.next(nextState);
  }

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
    private toastr: NgxToastrService,
  ) {
    const initialValue: Key = {
      address: null,
      algo: null,
      bech32Address: null,
      isNanoLedger: null,
      name: null,
      pubKey: null,
    };
    this._wallet$ = new BehaviorSubject(null);
    this.wallet$ = this._wallet$.asObservable();
    const lastProvider = session.getItem<WalletStorage>(LAST_USED_PROVIDER);

    if (lastProvider) {
      const { provider, chainId } = lastProvider;
      this.connect(provider, chainId);
    }
  }

  connect(wallet: WALLET_PROVIDER, chainId: string): any {
    switch (wallet) {
      case WALLET_PROVIDER.KEPLR:
        this.connectKeplr(chainId);
        window.addEventListener('keplr_keystorechange', (event) => {
          this.connect(WALLET_PROVIDER.KEPLR, chainId);
        });
        break;
      case WALLET_PROVIDER.COIN98:
        this.connectCoin98(chainId);
        break;
    }
  }

  disconnect(): void {
    this.setWallet(null);

    session.removeItem(LAST_USED_PROVIDER);
  }

  private connectKeplr(chainId: string): void {
    const checkWallet = async () => {
      try {
        const keplr = await getKeplr();

        if (keplr) {
          await keplr.enable(chainId);

          const account = await keplr.getKey(chainId);

          if (account) {
            this.setWallet(account);
            session.setItem<WalletStorage>(LAST_USED_PROVIDER, {
              provider: WALLET_PROVIDER.KEPLR,
              chainId,
            });
          }
        } else {
          this.disconnect();
          window.open('https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en');
        }
      } catch (e: any) {
        const handleErrors = async () => {
          this.handleErrors(e, chainId);
        };

        handleErrors();
        this.disconnect();
      }
    };
    checkWallet();
  }

  private connectCoin98(chainId: string): void {}

  private checkExistedCoin98(): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(false);
    });
  }

  public getWalletDetail(address: string): Observable<IResponsesTemplate<IWalletDetail>> {
    if (!address) {
      return of(null);
    }
    return this.http.get<any>(`${this.apiUrl}/wallets/${address}`);
  }

  private getError(err: any): KEPLR_ERRORS {
    if (err.toUpperCase().includes(KEPLR_ERRORS.NoChainInfo)) {
      return KEPLR_ERRORS.NoChainInfo;
    } else if (err.toUpperCase().includes(KEPLR_ERRORS.NOT_EXIST)) {
      return KEPLR_ERRORS.NOT_EXIST;
    } else if (err.toUpperCase().includes(KEPLR_ERRORS.RequestRejected)) {
      return KEPLR_ERRORS.RequestRejected;
    }

    return KEPLR_ERRORS.Failed;
  }

  private async handleErrors(err: Error, chainId: string): Promise<any> {
    const error = this.getError(err.message);
    switch (error) {
      case KEPLR_ERRORS.NoChainInfo:
        this.keplrSuggestChain(chainId);
        break;
      case KEPLR_ERRORS.NOT_EXIST:
        window.open('https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en');
        break;
      default:
        this.toastr.error(err.message);
    }
  }

  async keplrSuggestChain(chainId: string): Promise<any> {
    if (ChainsInfo[chainId]) {
      (await getKeplr())
        .experimentalSuggestChain(ChainsInfo[chainId])
        .then(() => {
          this.connectKeplr(chainId);
        })
        .catch((e: Error) => {
          this.toastr.error(e.message);
        });
    }
  }
}
