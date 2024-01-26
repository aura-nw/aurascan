import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Chain } from '@chain-registry/types';
import { WalletAccount, WalletConnectOptions } from '@cosmos-kit/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { allChains, desktopWallets, mobileWallets, wcWallets } from 'src/app/core/utils/cosmoskit';
import { getGasPriceByChain } from 'src/app/core/utils/cosmoskit/helpers/gas';
import { WalletBottomSheetComponent } from './wallet-bottom-sheet/wallet-bottom-sheet.component';
import { WalletDialogComponent } from './wallet-dialog/wallet-dialog.component';

@Component({
  selector: 'app-wallet-connect',
  templateUrl: './wallet-connect.component.html',
  styleUrls: ['./wallet-connect.component.scss'],
})
export class WalletConnectComponent implements OnInit {
  CHAIN_ID = this.env.chainId;
  chain = allChains.find((c) => c.chain_id == this.CHAIN_ID);
  walletSupportedList = this.env.isMobile ? mobileWallets : [...desktopWallets, ...wcWallets];
  walletConnectionOption: WalletConnectOptions = {
    signClient: {
      projectId: 'f371e1f6882d401122d20c719baf663a',
      relayUrl: 'wss://relay.walletconnect.org',
      metadata: {
        name: 'Aurascan',
        description: 'Aura Network Explorer',
        url: 'https://ngx-cosmoskit.vercel.app/',
        icons: ['https://images.aura.network/aurascan/xstaxy-assets/images/logo/aura-explorer-logo.png'],
      },
    },
  };

  signerOptions = {
    signingCosmwasm: (chain: Chain) => ({ gasPrice: getGasPriceByChain(chain) }),
    signingStargate: (chain: Chain) => ({ gasPrice: getGasPriceByChain(chain) }),
  };

  wallet$: Observable<WalletAccount> = this.walletsService.walletAccount$;
  chainInfo = this.env.chainInfo;

  constructor(
    public commonService: CommonService,
    private walletsService: WalletService,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    private notificationsService: NotificationsService,
    private env: EnvironmentService,
  ) {}

  async ngOnInit() {
    try {
      this.walletsService.initWalletManager({
        chain: this.chain,
        wallets: this.walletSupportedList,
        throwErrors: true,
        walletConnectOptions: this.walletConnectionOption,
        disableIframe: true,
        signerOptions: this.signerOptions as any,
      });

      this.configActions();

      await this.walletsService.restoreAccounts();
    } catch (error) {
      console.log('initWalletManager error', error);
    }
  }

  configActions() {
    this.walletsService.walletManager?.setActions({
      viewOpen: this.openWalletPopup.bind(this),
    });
  }

  openWalletPopup() {
    if (this.walletsService.walletManager?.isMobile || this.env.isMobile) {
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
    this.walletsService.disconnect();
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
