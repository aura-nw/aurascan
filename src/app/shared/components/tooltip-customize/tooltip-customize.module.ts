import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { TooltipCustomizeComponent } from './tooltip-customize.component';

@NgModule({
  declarations: [TooltipCustomizeComponent],
  imports: [CommonModule, CommonPipeModule],
  exports: [TooltipCustomizeComponent],
})
export class TooltipCustomizeModule {}
