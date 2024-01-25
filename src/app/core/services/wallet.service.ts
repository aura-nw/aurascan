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

  constructor(
    private environmentService: EnvironmentService,
    public translate: TranslateService,
  ) {
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

  async getWalletSign(minter, message) {}

  openWalletPopup(): void {}
}
