import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { QRCodeModule } from 'angularx-qrcode';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { MaterialModule } from 'src/app/material.module';
import { SharedModule } from '../../shared.module';
import { QrModule } from '../qr/qr.module';
import { TooltipCustomizeModule } from '../tooltip-customize/tooltip-customize.module';
import { QrcodeComponent } from './qrcode/qrcode.component';
import { WalletBottomSheetComponent } from './wallet-bottom-sheet/wallet-bottom-sheet.component';
import { WalletConnectComponent } from './wallet-connect.component';
import { WalletDialogComponent } from './wallet-dialog/wallet-dialog.component';
import { WalletProviderComponent } from './wallet-provider/wallet-provider.component';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';

@NgModule({
  declarations: [
    WalletConnectComponent,
    WalletDialogComponent,
    WalletBottomSheetComponent,
    WalletProviderComponent,
    QrcodeComponent,
  ],
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
    QRCodeModule,
    SharedModule,
    CommonDirectiveModule,
  ],
  exports: [WalletConnectComponent],
})
export class WalletConnectModule {}
