import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Key } from "@keplr-wallet/types";
import makeBlockie from "ethereum-blockies-base64";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { WALLET_PROVIDER } from "src/app/core/constants/wallet.constant";
import { EnvironmentService } from "src/app/core/data-services/environment.service";
import { WalletService } from "src/app/core/services/wallet.service";
import { createSignBroadcast } from "src/app/core/utils/signing/transaction-manager";

@Component({
  selector: "app-wallet-connect",
  templateUrl: "./wallet-connect.component.html",
  styleUrls: ["./wallet-connect.component.scss"],
})
export class WalletConnectComponent implements OnInit, AfterViewInit {
  walletAddress: string = null;

  walletName = "My Wallet";

  trigger: "hide" | "show" = "hide";

  avatarValue = this.walletAddress
    ? makeBlockie(this.walletAddress)
    : makeBlockie(this.walletName);

  wallet$: Observable<Key> = this.walletService.wallet$.pipe(
    tap((wallet) => {
      if (wallet?.bech32Address) {
        this.avatarValue = makeBlockie(wallet.bech32Address);
      }
    })
  );

  @ViewChild("offcanvasWallet") offcanvasWallet: ElementRef;

  chainId = this.envService.apiUrl.value.chainId;

  ngOnInit(): void {
    this.wallet$.subscribe();
  }
  constructor(private walletService: WalletService, private envService: EnvironmentService) {}

  ngAfterViewInit(): void {
    this.offcanvasWallet.nativeElement.addEventListener(
      "show.bs.offcanvas",
      () => {
        this.trigger = "show";
      }
    );

    this.offcanvasWallet.nativeElement.addEventListener(
      "hide.bs.offcanvas",
      () => {
        this.trigger = "hide";
      }
    );
  }

  connectWallet(provider: WALLET_PROVIDER): void {    
    try {
      this.walletService.connect(provider, this.chainId);
    } catch (error) {
      console.error(error);
    }
  }

  disconnect(): void {
    this.walletService.disconnect();
  }

  shortenWallet(address: string): string {
    return address
      ? `${new String(address).slice(0, 6)}...${address.slice(
          address.length - 6
        )}`
      : "";
  }

  test(): void {
    createSignBroadcast(null);
  }
}
