import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Keplr, Key } from '@keplr-wallet/types';
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
  chainId = this.environmentService.apiUrl.value.chainId;
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
    this._wallet$ = new BehaviorSubject(null);
    this.wallet$ = this._wallet$.asObservable();
    const lastProvider = session.getItem<WalletStorage>(LAST_USED_PROVIDER);

    if (lastProvider) {
      const { provider, chainId } = lastProvider;
      this.connect(provider, chainId);
    }

    window.addEventListener('keplr_keystorechange', (event) => {
      const lastProvider = session.getItem<WalletStorage>(LAST_USED_PROVIDER);
      if (lastProvider) {
        this.connect(lastProvider.provider, lastProvider.chainId);
      }
    });
  }

  connect(wallet: WALLET_PROVIDER, chainId: string): Promise<void> {
    switch (wallet) {
      case WALLET_PROVIDER.KEPLR:
        return this.connectKeplr(chainId);

      case WALLET_PROVIDER.COIN98:
        return this.connectCoin98(chainId);
    }
  }

  disconnect(): void {
    this.setWallet(null);

    session.removeItem(LAST_USED_PROVIDER);
  }

 private async connectKeplr(chainId: string): Promise<void> {
    const checkWallet = async () => {
      try {
        const keplr = await getKeplr();

        if (keplr) {
          await this.keplrSuggestChain(chainId);
          await keplr.enable(chainId);

          const account = await keplr.getKey(chainId);

          if (account) {
            this.setWallet(account);
            session.setItem<WalletStorage>(LAST_USED_PROVIDER, {
              provider: WALLET_PROVIDER.KEPLR,
              chainId,
            });

            // if (callback) {
            //   callback(account);
            // }
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

  private async connectCoin98(chainId: string): Promise<void> {
    const coin98 = await this.checkExistedCoin98();

    if (coin98) {
      try {
        coin98.enable(chainId);

        const account = await coin98.getKey(chainId);

        if (account) {
          this.setWallet(account);
          session.setItem<WalletStorage>(LAST_USED_PROVIDER, {
            provider: WALLET_PROVIDER.KEPLR,
            chainId,
          });
        }
      } catch (e: any) {
        const handleErrors = async () => {
          this.handleErrors(e, chainId);
        };

        handleErrors();
        this.disconnect();
      }
    } else {
      this.disconnect();
      window.open('https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en');
    }
  }

  private async checkExistedCoin98(): Promise<Keplr> {
    if ((window as any).coin98 && (window as any).coin98?.keplr) {
      return (window as any).coin98.keplr;
    }

    if (document.readyState === 'complete') {
      return (window as any).coin98.keplr;
    }

    return new Promise((resolve) => {
      const documentStateChange = (event: Event) => {
        if (event.target && (event.target as Document).readyState === 'complete') {
          resolve((window as any).coin98.keplr);
          document.removeEventListener('readystatechange', documentStateChange);
        }
      };

      document.addEventListener('readystatechange', documentStateChange);
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
        // this.keplrSuggestChain(chainId);
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
          // this.connectKeplr(chainId);
        })
        .catch((e: Error) => {
          this.toastr.error(e.message);
        });
    }
  }
}
