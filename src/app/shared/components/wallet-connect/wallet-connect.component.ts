import { Component, Input, OnInit } from "@angular/core";
import { Key } from "@keplr-wallet/types";
import makeBlockie from "ethereum-blockies-base64";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { WALLET_PROVIDER } from "src/app/core/constants/wallet.constant";
import { WalletService } from "src/app/core/services/wallet.service";

@Component({
  selector: "app-wallet-connect",
  templateUrl: "./wallet-connect.component.html",
  styleUrls: ["./wallet-connect.component.scss"],
})
export class WalletConnectComponent implements OnInit {
  walletAddress: string = null;

  walletName = "My Wallet";

  avatarValue = this.walletAddress
    ? makeBlockie(this.walletAddress)
    : makeBlockie(this.walletName);

  wallet$: Observable<Key> = this.walletService.wallet$

  ngOnInit(): void {
    this.wallet$.subscribe()
  }
  constructor(private walletService: WalletService) {}

  connectWallet(e): void {
    try {
      this.walletService.connect(WALLET_PROVIDER.KEPLR, "aura-testnet");
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
