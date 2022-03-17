import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WalletConnectComponent } from "./wallet-connect.component";
import { WalletListComponent } from "./wallet-list/wallet-list.component";
import { WalletDetailComponent } from './wallet-detail/wallet-detail.component';
import { NgApexchartsModule } from "ng-apexcharts";

@NgModule({
  declarations: [WalletConnectComponent, WalletListComponent, WalletDetailComponent],
  imports: [CommonModule, NgApexchartsModule],
  exports: [WalletConnectComponent],
})
export class WalletConnectModule {}
