import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { ContractPopoverComponent } from './contract-popover.component';

@NgModule({
  declarations: [ContractPopoverComponent],
  imports: [CommonModule, RouterModule, NgxMaskModule, CommonPipeModule],
  exports: [ContractPopoverComponent],
})
export class ContractPopoverModule {}
