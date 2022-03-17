import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import makeBlockie from "ethereum-blockies-base64";
import { WalletInfo } from "src/app/core/models/wallet";

@Component({
  selector: "app-wallet-list",
  templateUrl: "./wallet-list.component.html",
  styleUrls: ["./wallet-list.component.scss"],
})
export class WalletListComponent {
  @Input() walletList: WalletInfo[] = [
    {
      name: "Keplr",
      icon: '../../../../../../assets/images/icon-keplr.svg',
    },
    {
      name: "Coin98",
      icon: '../../../../../../assets/images/icon-coin98.svg',
    },
  ];

  @Output() onConnect = new EventEmitter<string>();

  connect(wallet: WalletInfo): void {
    this.onConnect.emit(wallet.name);
  }
}
