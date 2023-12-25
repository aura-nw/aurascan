import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { TooltipCustomizeModule } from '../tooltip-customize/tooltip-customize.module';
import { NameTagComponent } from './name-tag.component';

@NgModule({
  declarations: [NameTagComponent],
  imports: [CommonModule, CustomPipeModule, RouterModule, TooltipCustomizeModule],
  exports: [NameTagComponent],
})
export class NameTagModule {}
