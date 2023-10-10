import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { ContractPopoverComponent } from './contract-popover.component';

@NgModule({
  declarations: [ContractPopoverComponent],
  imports: [CommonModule, RouterModule, NgxMaskDirective, NgxMaskPipe, CommonPipeModule],
  exports: [ContractPopoverComponent],
  providers: [provideNgxMask()],
})
export class ContractPopoverModule {}
