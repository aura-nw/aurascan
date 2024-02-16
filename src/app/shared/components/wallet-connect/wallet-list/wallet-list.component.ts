import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Component, OnInit} from '@angular/core';
import {MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {Subject, takeUntil} from 'rxjs';
import {EnvironmentService} from 'src/app/core/data-services/environment.service';
import {DialogService} from 'src/app/core/services/dialog.service';
import {WalletService} from 'src/app/core/services/wallet.service';
import {WALLET_PROVIDER} from '../../../../core/constants/wallet.constant';
import {IWalletInfo} from '../../../../core/models/wallet';

@Component({
  selector: 'app-wallet-list',
  templateUrl: './wallet-list.component.html',
  styleUrls: ['./wallet-list.component.scss'],
})
export class WalletListComponent implements OnInit {
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
      // disableMobile: true,
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
    public dialogRef: MatDialogRef<WalletListComponent>,
    private dlgService: DialogService,
    private walletService: WalletService,
    private breakpointObserver: BreakpointObserver,
    private environmentService: EnvironmentService,
  ) {
    this.breakpoint$.subscribe((state) => {
      if (state) {
        this.isMobileMatched = state.matches;
      }
    });
  }

  ngOnInit(): void {
    this.walletService.wallet$.pipe(takeUntil(this.destroyed$)).subscribe((wallet) => {
      if (wallet) {
        this.dialogRef.close();
      }
    });
    this.isMobileMatched = window.innerWidth <= 992;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
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
          this.dialogRef.close();
        }
      };

      connect();
    } catch (error) {
      console.error(error);
    }
  }
}
