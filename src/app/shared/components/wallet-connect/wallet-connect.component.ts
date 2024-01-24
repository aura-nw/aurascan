import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { wallets as coin98Wallets } from '@cosmos-kit/coin98';
import { MainWalletBase, WalletBase, WalletConnectOptions } from '@cosmos-kit/core';
import { wallets as keplrWallets } from '@cosmos-kit/keplr';
import { wallets as leapWallets } from '@cosmos-kit/leap';
import { chains } from 'chain-registry';
import { Observable, of } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { WalletsService } from 'src/app/core/services/wallets.service';
import { wallets as coin98MobileWallets } from 'src/app/core/utils/wallets/coin98-mobile';
import { wallets as walletConnect } from 'src/app/core/utils/wallets/wallet-connect/wc';
import { WalletListComponent } from './wallet-list/wallet-list.component';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { WalletBottomSheetComponent } from './wallet-bottom-sheet/wallet-bottom-sheet.component';

@Component({
  selector: 'app-wallet-connect',
  templateUrl: './wallet-connect.component.html',
  styleUrls: ['./wallet-connect.component.scss'],
})
export class WalletConnectComponent implements OnInit {
  wallet$: Observable<any> = of(null);

  CHAIN_NAME = 'aura';

  chain = chains.find((c) => c.chain_name == this.CHAIN_NAME);

  walletSupportedList = [
    ...keplrWallets,
    ...leapWallets,
    ...coin98Wallets,
    ...coin98MobileWallets,
    ...walletConnect,
  ] as MainWalletBase[];

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

  constructor(
    public commonService: CommonService,
    private walletsService: WalletsService,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    private notificationsService: NotificationsService,
  ) {}

  ngOnInit(): void {
    try {
      this.walletsService.initWalletManager({
        chain: this.chain,
        wallets: this.walletSupportedList,
        throwErrors: true,
        walletConnectOptions: this.walletConnectionOption,
        disableIframe: true,
      });

      this.popup();

      this.walletsService.walletManager.getWalletRepo(this.CHAIN_NAME).openView();
    } catch (error) {
      console.log('initWalletManager error', error);
    }
  }

  popup() {
    this.walletsService.walletManager.setActions({
      viewOpen: this.openWalletPopup.bind(this),
    });
  }

  openWalletPopup() {
    if (this.walletsService.walletManager?.isMobile) {
      this.notificationsService.hiddenFooterSubject.next(true);
      this.bottomSheet.open(WalletBottomSheetComponent, {
        panelClass: 'wallet-popup--mob',
      });
      this.bottomSheet._openedBottomSheetRef.afterDismissed().subscribe((res) => {
        this.notificationsService.hiddenFooterSubject.next(false);
      });
    } else {
      this.dialog.open(WalletListComponent, {
        panelClass: 'wallet-popup',
        width: '730px',
      });
    }
  }

  disconnect(): void {}

  copyMessage(text: string) {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  }

  connect(wallet: WalletBase) {
    console.log(wallet);

    const chainWallet = this.walletsService.getChainWallet(wallet.walletName);

    chainWallet
      ?.connect()
      .then(() => {
        return chainWallet.client.getAccount(chainWallet.chainId);
      })
      .then((account) => {
        console.log(account);
      })
      .catch((e) => {
        console.log('Eeee', e);
      });
  }
}
