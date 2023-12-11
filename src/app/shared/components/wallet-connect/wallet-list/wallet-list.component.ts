import { Component, HostListener, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { DialogService } from 'src/app/core/services/dialog.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { WALLET_PROVIDER } from '../../../../core/constants/wallet.constant';
import { IWalletInfo } from '../../../../core/models/wallet';

@Component({
  selector: 'app-wallet-list',
  templateUrl: './wallet-list.component.html',
  styleUrls: ['./wallet-list.component.scss'],
})
export class WalletListComponent implements OnInit {
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
    public dialogRef: MatDialogRef<WalletListComponent>,
    private dlgService: DialogService,
    private walletService: WalletService,
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobileMatched = window.innerWidth <= 992;
  }

  ngOnInit(): void {
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.dialogRef.close();
      }
    });
    this.isMobileMatched = window.innerWidth <= 992;
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
