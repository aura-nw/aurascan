import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WALLET_PROVIDER } from '../constants/wallet.constant';
import { EnvironmentService } from '../data-services/environment.service';

export type WalletKey = any;

@Injectable({
  providedIn: 'root',
})
export class WalletService implements OnDestroy {
  chainId = this.environmentService.chainId;
  chainInfo = this.environmentService.chainInfo;
  graphUrl = `${this.environmentService.horoscope.url + this.environmentService.horoscope.graphql}`;

  destroyed$ = new Subject<void>();
  wallet$: Observable<WalletKey>;

  private _wallet$: BehaviorSubject<WalletKey>;

  get wallet(): WalletKey {
    return this._wallet$.getValue();
  }

  setWallet(nextState: WalletKey): void {
    this._wallet$.next(nextState);
  }

  isMobileMatched = false;
  breakpoint$ = this.breakpointObserver
    .observe([Breakpoints.Small, Breakpoints.XSmall])
    .pipe(takeUntil(this.destroyed$));

  constructor(
    private environmentService: EnvironmentService,
    private breakpointObserver: BreakpointObserver,
    public translate: TranslateService,
  ) {
    this.breakpoint$.subscribe((state) => {
      if (state) {
        this.isMobileMatched = state.matches;
      }
    });

    this._wallet$ = new BehaviorSubject(null);
    this.wallet$ = this._wallet$.asObservable();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  mobileConnect(): any {}

  connect(provider: WALLET_PROVIDER): any {}

  disconnect(): void {}

  getAccount(): WalletKey {
    const account = this.wallet;

    if (account) {
      return account;
    }

    this.openWalletPopup();

    return null;
  }

  async catchErrors(e, isMobileDevice = false) {}

  async signAndBroadcast(
    {
      messageType,
      message,
      senderAddress,
      network,
      chainId,
    }: { messageType: any; message: any; senderAddress: any; network: any; chainId: any },
    validatorsCount?: number,
  ) {
    return null;
  }

  signMessage(base64String: string) {}

  async execute(userAddress, contract_address, msg, feeGas = null) {}

  suggestChain(w: any) {
    return w.experimentalSuggestChain(this.chainInfo);
  }

  async getWalletSign(minter, message) {}

  openWalletPopup(): void {}
}
