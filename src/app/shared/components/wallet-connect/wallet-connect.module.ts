import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WalletConnectComponent } from "./wallet-connect.component";
import { WalletListComponent } from "./wallet-list/wallet-list.component";
import { WalletDetailComponent } from "./wallet-detail/wallet-detail.component";
import { NgApexchartsModule } from "ng-apexcharts";
import { MatMenuModule } from "@angular/material/menu";
import { FeatherModule } from "angular-feather";
import { RouterModule } from "@angular/router";
import { ClickOutsideModule } from "ng-click-outside";
import { QrModule } from "../qr/qr.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  declarations: [
    WalletConnectComponent,
    WalletListComponent,
    WalletDetailComponent,
  ],
  imports: [
    CommonModule,
    NgApexchartsModule,
    MatMenuModule,
    FeatherModule,
    RouterModule,
    ClickOutsideModule,
    QrModule,
    TranslateModule
  ],
  exports: [WalletConnectComponent],
})
export class WalletConnectModule {}
