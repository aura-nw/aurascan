import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Chain } from '@chain-registry/types';
import { Observable, tap } from 'rxjs';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { IMultichainWalletAccount } from 'src/app/core/models/wallet';
import { CommonService } from 'src/app/core/services/common.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { allChains, desktopWallets, mobileWallets, wcWallets } from 'src/app/core/utils/cosmoskit';
import { getGasPriceByChain } from 'src/app/core/utils/cosmoskit/helpers/gas';
import { checkDesktopWallets } from 'src/app/core/utils/cosmoskit/wallets';
import { WalletBottomSheetComponent } from './wallet-bottom-sheet/wallet-bottom-sheet.component';
import { WalletDialogComponent } from './wallet-dialog/wallet-dialog.component';

@Component({
  selector: 'app-wallet-connect',
  templateUrl: './wallet-connect.component.html',
  styleUrls: ['./wallet-connect.component.scss'],
})
export class WalletConnectComponent implements OnInit {
  CHAIN_ID = this.env.chainId;
  walletType: 'cosmos' | 'evm' | '';
  signerOptions = {
    signingCosmwasm: (chain: Chain) => ({ gasPrice: getGasPriceByChain(chain) }),
    signingStargate: (chain: Chain) => ({ gasPrice: getGasPriceByChain(chain) }),
    preferredSignType: (_: Chain) => 'direct',
  };

  wallet$: Observable<IMultichainWalletAccount> = this.walletService.walletAccount$;

  constructor(
    public commonService: CommonService,
    private walletService: WalletService,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    private notificationsService: NotificationsService,
    private env: EnvironmentService,
  ) {}

  async ngOnInit() {
    try {
      const chain = allChains.find((chain) => chain.chain_id == this.CHAIN_ID);

      const desktop = desktopWallets.filter((w) => checkDesktopWallets(w.walletName));
      const wallets = this.env.isMobile ? mobileWallets : [...desktop, ...wcWallets];

      this.walletService
        .initWalletManager({
          chain,
          wallets,
          throwErrors: true,
          walletConnectOptions: this.env.walletConnect,
          disableIframe: true,
          signerOptions: this.signerOptions as any,
        })
        .then((code) => {
          if (code == 'SUCCESS') {
            this.configActions();
            this.walletService.restoreAccounts();
          }
        })
        .catch((error) => {
          console.error('InitWalletManager Error: ', error);
        });
    } catch (error) {
      console.error('Init Wallet Error: ', error);
    }
  }

  configActions() {
    this.walletService.setWalletAction({
      viewOpen: this.openWalletPopup.bind(this),
    });
  }

  openWalletPopup() {
    if (this.walletService?.isMobile || this.env.isMobile) {
      this.notificationsService.hiddenFooterSubject.next(true);
      this.bottomSheet.open(WalletBottomSheetComponent, {
        panelClass: 'wallet-popup--mob',
      });
      this.bottomSheet._openedBottomSheetRef.afterDismissed().subscribe((res) => {
        this.notificationsService.hiddenFooterSubject.next(false);
      });
    } else {
      this.dialog.open(WalletDialogComponent, {
        panelClass: 'wallet-popup',
        width: '730px',
      });
    }
  }

  disconnect(): void {
    this.walletService.disconnect();
  }

  copyMessage(text: string) {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  }
}

