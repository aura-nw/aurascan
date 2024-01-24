import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { wallets as coin98Wallets } from '@cosmos-kit/coin98';
import { Wallet, WalletAccount } from '@cosmos-kit/core';
import { wallets as keplrWallets } from '@cosmos-kit/keplr';
import { wallets as leapWallets } from '@cosmos-kit/leap';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { WalletsService } from 'src/app/core/services/wallets.service';
import { wallets as WCWallets } from 'src/app/core/utils/wallets/wallet-connect/wc';

@Component({
  selector: 'app-wallet-list',
  templateUrl: './wallet-list.component.html',
  styleUrls: ['./wallet-list.component.scss'],
})
export class WalletListComponent implements OnInit {
  chainName = this.environmentService.chainName;

  wallets = this.wallet.wallets.filter((w) => w.isModeExtension).map((w) => w.walletInfo);

  otherWallets = WCWallets.map((w) => w.walletInfo);

  constructor(
    public dialogRef: MatDialogRef<WalletListComponent>,
    private environmentService: EnvironmentService,
    private wallet: WalletsService,
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  close(walletAccount: WalletAccount): void {
    if (walletAccount) {
      this.wallet.walletAccount = walletAccount;
    }

    this.dialogRef.close();
  }
}
