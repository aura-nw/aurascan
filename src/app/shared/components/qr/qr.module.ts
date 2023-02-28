import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrComponent } from './qr.component';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [QrComponent],
  imports: [CommonModule, QRCodeModule],
  exports: [QrComponent],
})
export class QrModule {}
