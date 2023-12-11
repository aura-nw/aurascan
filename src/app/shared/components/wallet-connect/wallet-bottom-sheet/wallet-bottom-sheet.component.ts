import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Subject, takeUntil } from 'rxjs';
import { WALLET_PROVIDER } from 'src/app/core/constants/wallet.constant';
import { IWalletInfo } from 'src/app/core/models/wallet';
import { DialogService } from 'src/app/core/services/dialog.service';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-wallet-bottom-sheet',
  templateUrl: './wallet-bottom-sheet.component.html',
  styleUrls: ['./wallet-bottom-sheet.component.scss'],
})
export class WalletBottomSheetComponent implements OnInit {
  walletProvider = WALLET_PROVIDER;
  walletList: IWalletInfo[] = [
    {
      name: WALLET_PROVIDER.COIN98,
      icon: '../../../../../../assets/images/icon-coin98.svg',
    },
    {
      name: WALLET_PROVIDER.KEPLR,
      icon: '../../../../../../assets/images/icon-keplr.svg',
      disableMobile: true,
    },
    {
      name: WALLET_PROVIDER.LEAP,
      icon: '../../../../../../assets/images/icon-leap.svg',
    },
  ];
  isMobileMatched = false;
  destroyed$ = new Subject<void>();
  breakpoint$ = this.breakpointObserver
    .observe([Breakpoints.Small, Breakpoints.XSmall])
    .pipe(takeUntil(this.destroyed$));

  constructor(
    private breakpointObserver: BreakpointObserver,
    private dlgService: DialogService,
    private walletService: WalletService,
    public _bottomSheetRef: MatBottomSheetRef<WalletBottomSheetComponent>,
  ) {
    this.breakpoint$.subscribe((state) => {
      if (state) {
        this.isMobileMatched = state.matches;
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobileMatched = window.innerWidth <= 992;
  }

  ngOnInit(): void {
    this.isMobileMatched = window.innerWidth <= 992;
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this._bottomSheetRef.dismiss();
      }
    });
  }

  connectWallet(provider: WALLET_PROVIDER): void {
    try {
      const connect = async () => {
        const connect = await this.walletService.connect(provider);
        if (!connect && provider === WALLET_PROVIDER.COIN98 && !this.isMobileMatched) {
          this.dlgService.showDialog({
            title: '',
            content: 'Please set up override Keplr in settings of Coin98 wallet',
          });
          this._bottomSheetRef.dismiss();
        }
      };

      connect();
    } catch (error) {
      console.error(error);
    }
  }
}
