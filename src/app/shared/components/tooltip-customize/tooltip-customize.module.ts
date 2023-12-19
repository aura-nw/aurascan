import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { TooltipCustomizeComponent } from './tooltip-customize.component';

@NgModule({
  declarations: [TooltipCustomizeComponent],
  imports: [CommonModule, CustomPipeModule],
  exports: [TooltipCustomizeComponent],
})
export class TooltipCustomizeModule {}
