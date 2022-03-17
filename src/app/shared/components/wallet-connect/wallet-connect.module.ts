import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WalletConnectComponent } from "./wallet-connect.component";
import { WalletListComponent } from "./wallet-list/wallet-list/wallet-list.component";

@NgModule({
  declarations: [WalletConnectComponent, WalletListComponent],
  imports: [CommonModule],
  exports: [WalletConnectComponent],
})
export class WalletConnectModule {}
