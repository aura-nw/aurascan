import { Injectable, OnDestroy } from '@angular/core';
import { ChainInfo, Keplr, Key } from '@keplr-wallet/types';
import { BehaviorSubject, Observable } from 'rxjs';
import { LAST_USED_PROVIDER, WALLET_PROVIDER } from '../constants/wallet.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { WalletStorage } from '../models/wallet';
import { getKeplr, handleErrors, keplrSuggestChain } from '../utils/keplr';
import session from '../utils/storage/session';
import { NgxToastrService } from './ngx-toastr.service';
import { Client, Chain } from '@coin98-com/connect-sdk';

@Injectable({
  providedIn: 'root',
})
export class WalletService implements OnDestroy {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  chainId = this.environmentService.configValue.chainId;
  chainInfo = this.environmentService.configValue.chain_info;

  wallet$: Observable<Key>;
  private _wallet$: BehaviorSubject<Key>;

  coin98Client = new Client();

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

  connect(provider: WALLET_PROVIDER, chainId: string, mobile: boolean = false): Promise<boolean> {
    switch (provider) {
      case WALLET_PROVIDER.KEPLR:
        const coin98 = this.checkExistedCoin98();

        if (coin98) {
          this.connectCoin98(this.chainInfo);
        } else {
          this.connectKeplr(this.chainInfo);
        }

        return Promise.resolve(true);

      case WALLET_PROVIDER.COIN98:
        const _coin98 = this.checkExistedCoin98();

        if (_coin98 === undefined) {
          return Promise.resolve(false);
        } else {
          this.connectCoin98(this.chainInfo, mobile);

          return Promise.resolve(true);
        }
    }
  }

  disconnect(): void {
    this.setWallet(null);

    session.removeItem(LAST_USED_PROVIDER);
  }

  private async connectKeplr(chainInfo: ChainInfo): Promise<void> {
    const checkWallet = async () => {
      try {
        const keplr = await getKeplr();

        if (keplr) {
          await keplrSuggestChain(chainInfo);
          await keplr.enable(chainInfo.chainId);

          const account = await keplr.getKey(chainInfo.chainId);

          if (account) {
            this.setWallet(account);
            session.setItem<WalletStorage>(LAST_USED_PROVIDER, {
              provider: WALLET_PROVIDER.KEPLR,
              chainId: chainInfo.chainId,
            });
          }
        } else {
          this.disconnect();
          window.open('https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en');
        }
      } catch (e: any) {
        this.catchErrors(e, chainInfo.chainId);
      }
    };
    checkWallet();
  }

  connectCoin98Mobile(chainId: string): Promise<unknown> {
    return this.coin98Client.connect(Chain.cosmos, {
      logo: this.chainInfo.logo,
      name: 'AuraScan',
      url: this.chainInfo.explorer,
    });
    // .then((response) => {
    //   const { result } = response as any;

    //   if (result) {
    //     return (window as any).coin98.cosmos.request({
    //       method: 'cosmos_getKey',
    //       params: [chainId],
    //     });
    //   }
    //   return response;
    // });
  }

  private async connectCoin98(chainInfo: ChainInfo, mobile = false): Promise<void> {
    const coin98 = await this.checkExistedCoin98();

    if (coin98) {
      try {
        await keplrSuggestChain(chainInfo);
        await coin98.enable(chainInfo.chainId);

        const account = await coin98.getKey(chainInfo.chainId);

        if (account) {
          this.setWallet(account);
          session.setItem<WalletStorage>(LAST_USED_PROVIDER, {
            provider: WALLET_PROVIDER.KEPLR,
            chainId: chainInfo.chainId,
          });
        }
      } catch (e: any) {
        this.catchErrors(e, chainInfo.chainId);
        this.disconnect();
      }
    } else {
      this.disconnect();
      window.open('https://chrome.google.com/webstore/detail/coin98-wallet/aeachknmefphepccionboohckonoeemg');
    }
  }

  private checkExistedCoin98(): Keplr | null | undefined {
    if ((window as any).coin98) {
      if ((window as any).coin98.keplr) {
        return (window as any).keplr || (window as any).coin98.keplr;
      } else {
        return undefined; // c98 not override keplr
      }
    }

    return null; // not found coin98
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
