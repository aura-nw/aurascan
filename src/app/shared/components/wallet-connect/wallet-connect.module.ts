import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ClickOutsideModule } from 'ng-click-outside';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { QrModule } from '../qr/qr.module';
import { WalletConnectComponent } from './wallet-connect.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { TooltipCustomizeModule } from '../tooltip-customize/tooltip-customize.module';
import { WalletListComponent } from './wallet-list/wallet-list.component';

@NgModule({
  declarations: [WalletConnectComponent, WalletListComponent],
  imports: [
    CommonModule,
    NgApexchartsModule,
    MatMenuModule,
    RouterModule,
    ClickOutsideModule,
    QrModule,
    TranslateModule,
    MatDialogModule,
    CommonPipeModule,
    ClipboardModule,
    TooltipCustomizeModule
  ],
  exports: [WalletConnectComponent],
})
export class WalletConnectModule {}
