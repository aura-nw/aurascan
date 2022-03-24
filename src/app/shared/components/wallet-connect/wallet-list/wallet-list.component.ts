import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import makeBlockie from "ethereum-blockies-base64";
import { WALLET_PROVIDER } from "src/app/core/constants/wallet.constant";
import { IWalletInfo } from "src/app/core/models/wallet";

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

  connect(wallet: IWalletInfo): void {
    this.onConnect.emit(wallet.name);
  }
}
