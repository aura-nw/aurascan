import { Injectable, OnDestroy } from '@angular/core';
import { Keplr, Key } from '@keplr-wallet/types';
import { BehaviorSubject, Observable } from 'rxjs';
import { LAST_USED_PROVIDER, WALLET_PROVIDER } from '../constants/wallet.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { WalletStorage } from '../models/wallet';
import { getKeplr, handleErrors, keplrSuggestChain } from '../utils/keplr';
import session from '../utils/storage/session';
import { NgxToastrService } from './ngx-toastr.service';

@Injectable({
  providedIn: 'root',
})
export class WalletService implements OnDestroy {
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

  dialogState$: Observable<'open' | 'close'>;
  private _dialogState$: BehaviorSubject<'open' | 'close'>;

  get dialogState(): 'open' | 'close' {
    return this._dialogState$.getValue();
  }

  setDialogState(nextState: 'open' | 'close'): void {
    this._dialogState$.next(nextState);
  }

  constructor(private environmentService: EnvironmentService, private toastr: NgxToastrService) {
    this._dialogState$ = new BehaviorSubject(null);
    this.dialogState$ = this._dialogState$.asObservable();

    this._wallet$ = new BehaviorSubject(null);
    this.wallet$ = this._wallet$.asObservable();
    const lastProvider = session.getItem<WalletStorage>(LAST_USED_PROVIDER);

    if (lastProvider) {
      const { provider, chainId } = lastProvider;
      this.connect(provider, chainId);
    }

    window.addEventListener('keplr_keystorechange', () => {
      const lastProvider = session.getItem<WalletStorage>(LAST_USED_PROVIDER);
      if (lastProvider) {
        this.connect(lastProvider.provider, lastProvider.chainId);
      }
    });
  }

  ngOnDestroy(): void {
    window.removeAllListeners('keplr_keystorechange');
  }

  connect(provider: WALLET_PROVIDER, chainId: string): Promise<void> {
    if (!this.wallet) {
      this.setDialogState('open');
      return null;
    }

    switch (provider) {
      case WALLET_PROVIDER.KEPLR:
        return this.connectKeplr(chainId);

      case WALLET_PROVIDER.COIN98:
        return this.connectCoin98(chainId);

      default:
        this.toastr.error('Can not found ', provider);
        return null;
    }
  }

  disconnect(): void {
    this.setWallet(null);

    session.removeItem(LAST_USED_PROVIDER);
  }

  private async connectKeplr(chainId: string): Promise<void> {
    const checkWallet = async () => {
      try {
        const coin98 = await this.checkExistedCoin98();

        const keplr = coin98 || (await getKeplr());

        if (keplr) {
          !!!coin98 && (await keplrSuggestChain(chainId));
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
        this.catchErrors(e, chainId);
      }
    };
    checkWallet();
  }

  private async connectCoin98(chainId: string): Promise<void> {
    const coin98 = await this.checkExistedCoin98();

    if (coin98) {
      try {
        await coin98.enable(chainId);

        const account = await coin98.getKey(chainId);

        if (account) {
          this.setWallet(account);
          session.setItem<WalletStorage>(LAST_USED_PROVIDER, {
            provider: WALLET_PROVIDER.KEPLR,
            chainId,
          });
        }
      } catch (e: any) {
        this.catchErrors(e, chainId);
        this.disconnect();
      }
    } else {
      this.disconnect();
      window.open('https://chrome.google.com/webstore/detail/coin98-wallet/aeachknmefphepccionboohckonoeemg');
    }
  }

  private async checkExistedCoin98(): Promise<Keplr | null> {
    if ((window as any).coin98) {
      return (window as any).keplr || (window as any).coin98.keplr;
    }

    return null;
  }

  getAccount(): Key {
    const account = this.wallet;

    if (account) {
      return account;
    }
    this.setDialogState('open');
    return null;
  }

  async catchErrors(e, chainId) {
    handleErrors(e, chainId).then((msg) => {
      if (msg) {
        this.toastr.error(msg);
      }
    });
  }
}
