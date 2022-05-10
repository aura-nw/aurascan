import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Key } from '@keplr-wallet/types';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccountStore, getKeplrFromWindow, WalletStatus } from '@keplr-wallet/stores';
import { WALLET_PROVIDER } from '../../../core/constants/wallet.constant';
import { EnvironmentService } from '../../../core/data-services/environment.service';
import { DialogService } from '../../../core/services/dialog.service';
import { WalletService } from '../../../core/services/wallet.service';
import { WalletManager } from 'src/app/core/helpers/connect-wallet';

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

  chainId = this.envService.apiUrl.value.chainId;

  walletManager = new WalletManager();

  destroy$ = new Subject();
  constructor(
    private walletService: WalletService,
    private envService: EnvironmentService,
    private dlgService: DialogService,
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

  connectWallet(provider: WALLET_PROVIDER): void {
    if (provider === WALLET_PROVIDER.MOBILE) {
      const connect = async () => {
        const result = await this.walletManager.getKeplr();
        console.log(result);
      };
      connect();
    } else {
      try {
        const connect = async () => {
          const connect = await this.walletService.connect(provider, this.chainId);
          if (!connect && provider === WALLET_PROVIDER.COIN98) {
            this.dlgService.showDialog({
              title: '',
              content: 'Please set up override Keplr in settings of Coin98 wallet',
            });
          }
          this.buttonDismiss.nativeElement.click();
        };

        connect();
      } catch (error) {
        console.error(error);
      }
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
