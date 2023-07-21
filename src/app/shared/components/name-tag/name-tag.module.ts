import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { TooltipCustomizeModule } from '../tooltip-customize/tooltip-customize.module';
import { NameTagComponent } from './name-tag.component';

@NgModule({
  declarations: [NameTagComponent],
  imports: [CommonModule, CommonPipeModule, RouterModule, TooltipCustomizeModule],
  exports: [NameTagComponent],
})
export class NameTagModule {}
