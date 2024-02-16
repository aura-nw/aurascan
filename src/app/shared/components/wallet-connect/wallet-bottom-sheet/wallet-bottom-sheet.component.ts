import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Subject, takeUntil } from 'rxjs';
import { WALLET_PROVIDER } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
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
  chainName = this.environmentService.chainName;
  walletList: IWalletInfo[] = [
    {
      name: WALLET_PROVIDER.COIN98,
      icon: '../../../../../../assets/images/icon-coin98.svg',
    },
    {
      name: WALLET_PROVIDER.KEPLR,
      icon: '../../../../../../assets/images/icon-keplr.svg',
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
    public bottomSheetRef: MatBottomSheetRef<WalletBottomSheetComponent>,
    private environmentService: EnvironmentService,
  ) {
    this.breakpoint$.subscribe((state) => {
      if (state) {
        this.isMobileMatched = state.matches;
      }
    });
  }

  ngOnInit(): void {
    this.isMobileMatched = window.innerWidth <= 992;
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.bottomSheetRef.dismiss();
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
          this.bottomSheetRef.dismiss();
        }
      };

      connect();
    } catch (error) {
      console.error(error);
    }
  }
}
