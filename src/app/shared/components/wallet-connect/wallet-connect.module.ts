import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { MaterialModule } from 'src/app/material.module';
import { QrModule } from '../qr/qr.module';
import { TooltipCustomizeModule } from '../tooltip-customize/tooltip-customize.module';
import { WalletBottomSheetComponent } from './wallet-bottom-sheet/wallet-bottom-sheet.component';
import { WalletConnectComponent } from './wallet-connect.component';
import { WalletListComponent } from './wallet-list/wallet-list.component';

@NgModule({
  declarations: [WalletConnectComponent, WalletListComponent, WalletBottomSheetComponent],
  imports: [
    CommonModule,
    NgApexchartsModule,
    RouterModule,
    NgClickOutsideDirective,
    QrModule,
    TranslateModule,
    CustomPipeModule,
    ClipboardModule,
    TooltipCustomizeModule,
    MaterialModule,
  ],
  exports: [WalletConnectComponent],
})
export class WalletConnectModule {}
