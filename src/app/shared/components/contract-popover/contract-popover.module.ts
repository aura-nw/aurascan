import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { ContractPopoverComponent } from './contract-popover.component';

@NgModule({
  declarations: [ContractPopoverComponent],
  imports: [CommonModule, RouterModule, NgxMaskDirective, NgxMaskPipe, CommonPipeModule],
  exports: [ContractPopoverComponent],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class ContractPopoverModule {}
