import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { QrModule } from '../qr/qr.module';
import { WalletConnectComponent } from './wallet-connect.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { TooltipCustomizeModule } from '../tooltip-customize/tooltip-customize.module';
import { WalletListComponent } from './wallet-list/wallet-list.component';
import { MaterialModule } from 'src/app/material.module';

@NgModule({
  declarations: [WalletConnectComponent, WalletListComponent],
  imports: [
    CommonModule,
    NgApexchartsModule,
    RouterModule,
    NgClickOutsideDirective,
    QrModule,
    TranslateModule,
    CommonPipeModule,
    ClipboardModule,
    TooltipCustomizeModule,
    MaterialModule,
  ],
  exports: [WalletConnectComponent],
})
export class WalletConnectModule {}
