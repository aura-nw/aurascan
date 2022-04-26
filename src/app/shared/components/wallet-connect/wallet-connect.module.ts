import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatMenuModule } from "@angular/material/menu";
import { RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { FeatherModule } from "angular-feather";
import { NgApexchartsModule } from "ng-apexcharts";
import { ClickOutsideModule } from "ng-click-outside";
import { QrModule } from "../qr/qr.module";
import { WalletConnectComponent } from "./wallet-connect.component";
import { WalletDetailComponent } from "./wallet-detail/wallet-detail.component";
import { WalletListComponent } from "./wallet-list/wallet-list.component";

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
    TranslateModule,
    MatDialogModule
  ],
  exports: [WalletConnectComponent],
})
export class WalletConnectModule {}
