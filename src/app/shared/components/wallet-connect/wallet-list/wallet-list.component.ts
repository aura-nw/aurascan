import { Component, EventEmitter, Input, Output } from "@angular/core";
import { WALLET_PROVIDER } from "../../../../core/constants/wallet.constant";
import { IWalletInfo } from "../../../../core/models/wallet";
@Component({
  selector: "app-wallet-list",
  templateUrl: "./wallet-list.component.html",
  styleUrls: ["./wallet-list.component.scss"],
})
export class WalletListComponent {
  @Input() walletList: IWalletInfo[] = [
    {
      name: WALLET_PROVIDER.KEPLR,
      icon: '../../../../../../assets/images/icon-keplr.svg',
    },
    {
      name: WALLET_PROVIDER.COIN98,
      icon: '../../../../../../assets/images/icon-coin98.svg',
    },
  ];

  @Output() onConnect = new EventEmitter<WALLET_PROVIDER>();
  @Output() onDismiss = new EventEmitter();

  connect(wallet: IWalletInfo): void {
    this.onConnect.emit(wallet.name);
  }

  dismiss(): void {
    this.onDismiss.emit();
  }
}
