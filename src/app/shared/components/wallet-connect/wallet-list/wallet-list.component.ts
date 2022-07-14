import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WALLET_PROVIDER } from '../../../../core/constants/wallet.constant';
import { IWalletInfo } from '../../../../core/models/wallet';
@Component({
  selector: 'app-wallet-list',
  templateUrl: './wallet-list.component.html',
  styleUrls: ['./wallet-list.component.scss'],
})
export class WalletListComponent {
  @Input() isMobile: boolean;
  @Input() walletList: IWalletInfo[] = [
    {
      name: WALLET_PROVIDER.COIN98,
      icon: '../../../../../../assets/images/icon-coin98.svg',
    },
    {
      name: WALLET_PROVIDER.KEPLR,
      icon: '../../../../../../assets/images/icon-keplr.svg',
      disableMobile: true,
    },
  ];

  @Output() onConnect = new EventEmitter<{ provider: WALLET_PROVIDER; mobile: boolean; type?: any }>();
  @Output() onDismiss = new EventEmitter();

  COIN98 = {
    name: WALLET_PROVIDER.COIN98,
    icon: '../../../../../../assets/images/icon-coin98.svg',
  };

  connect(wallet: IWalletInfo): void {
    this.onConnect.emit({
      provider: wallet.name,
      mobile: this.isMobile,
    });
  }

  action(type: string) {
    this.onConnect.emit({
      provider: WALLET_PROVIDER.COIN98,
      mobile: this.isMobile,
      type,
    });
  }

  dismiss(): void {
    this.onDismiss.emit();
  }
}
