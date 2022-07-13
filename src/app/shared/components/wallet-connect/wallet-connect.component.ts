import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Key } from '@keplr-wallet/types';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WALLET_PROVIDER } from '../../../core/constants/wallet.constant';
import { EnvironmentService } from '../../../core/data-services/environment.service';
import { DialogService } from '../../../core/services/dialog.service';
import { WalletService } from '../../../core/services/wallet.service';

@Component({
  selector: 'app-wallet-connect',
  templateUrl: './wallet-connect.component.html',
  styleUrls: ['./wallet-connect.component.scss'],
})
export class WalletConnectComponent implements AfterViewInit, OnDestroy {
  wallet$: Observable<Key> = this.walletService.wallet$;

  @ViewChild('offcanvasWallet') offcanvasWallet: ElementRef;
  @ViewChild('buttonDismiss') buttonDismiss: ElementRef<HTMLButtonElement>;
  @ViewChild('connectButton') connectButton: ElementRef<HTMLButtonElement>;

  chainId = this.envService.configValue.chainId;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  destroy$ = new Subject();

  coin98Res : any;
  constructor(
    private walletService: WalletService,
    private envService: EnvironmentService,
    private dlgService: DialogService,
    private layout: BreakpointObserver,
  ) {
    this.walletService.dialogState$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state === 'open') {
        this.connectButton?.nativeElement.click();
      } else {
        this.buttonDismiss?.nativeElement.click();
      }
    });
  }

  ngAfterViewInit(): void {
    this.offcanvasWallet.nativeElement.addEventListener('hide.bs.offcanvas', () => {
      this.walletService.setDialogState('close');
    });
  }

  ngOnDestroy(): void {
    document.removeAllListeners('hide.bs.offcanvas');
    this.destroy$.next();
    this.destroy$.complete();
  }

  connectWallet({ provider, mobile }: { provider: WALLET_PROVIDER; mobile: boolean }): void {
    try {
      const connect = async () => {
        if (mobile) {
          const r = await this.walletService.connectCoin98Mobile(this.chainId);
          this.coin98Res  = { r }
        } else {
          const connect = await this.walletService.connect(provider, this.chainId);
          if (!connect && provider === WALLET_PROVIDER.COIN98) {
            this.dlgService.showDialog({
              title: '',
              content: 'Please set up override Keplr in settings of Coin98 wallet',
            });
          }
          this.buttonDismiss.nativeElement.click();
        }
      };

      connect();
    } catch (error) {
      console.error(error);
    }
  }

  dismiss(): void {
    this.buttonDismiss.nativeElement.click();
  }

  disconnect(): void {
    this.walletService.disconnect();
  }

  shortenWallet(address: string): string {
    return address ? `${new String(address).slice(0, 6)}...${address.slice(address.length - 6)}` : '';
  }
}
