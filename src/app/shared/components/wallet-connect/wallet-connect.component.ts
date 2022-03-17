import { Component, Input, OnInit } from "@angular/core";
import makeBlockie from "ethereum-blockies-base64";
import { WALLET_PROVIDER } from "src/app/core/constants/wallet.constant";
import { WalletService } from "src/app/core/services/wallet.service";

@Component({
  selector: "app-wallet-connect",
  templateUrl: "./wallet-connect.component.html",
  styleUrls: ["./wallet-connect.component.scss"],
})
export class WalletConnectComponent implements OnInit {
  @Input() walletAddress: string = "";

  walletName = "My Wallet";

  avatarValue = this.walletAddress
    ? makeBlockie(this.walletAddress)
    : makeBlockie(this.walletName);

  ngOnInit(): void {}
  constructor(private wallet: WalletService) {}

  connectWallet(e): void {
    try {
      this.wallet.connect(WALLET_PROVIDER.KEPLR, "aura-testnet");
    } catch (e) {
      console.error(e);
    }
  }

  shortenWallet(address: string): string {
    return address
      ? `${new String(address).slice(0, 6)}...${address.slice(
          address.length - 6
        )}`
      : "";
  }
}
