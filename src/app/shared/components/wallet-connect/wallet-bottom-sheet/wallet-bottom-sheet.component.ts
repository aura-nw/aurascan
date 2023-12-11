import {Component, HostListener, OnInit} from '@angular/core';
import {WALLET_PROVIDER} from "src/app/core/constants/wallet.constant";
import {IWalletInfo} from "src/app/core/models/wallet";
import {BreakpointObserver} from "@angular/cdk/layout";
import {DialogService} from "src/app/core/services/dialog.service";
import {WalletService} from "src/app/core/services/wallet.service";
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";

@Component({
  selector: 'app-wallet-bottom-sheet',
  templateUrl: './wallet-bottom-sheet.component.html',
  styleUrls: ['./wallet-bottom-sheet.component.scss']
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

  constructor(
    private layout: BreakpointObserver,
    private dlgService: DialogService,
    private walletService: WalletService,
    public _bottomSheetRef: MatBottomSheetRef<WalletBottomSheetComponent>) {
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
