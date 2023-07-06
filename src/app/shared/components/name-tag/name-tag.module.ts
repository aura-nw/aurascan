import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { SharedModule } from '../../shared.module';
import { NameTagComponent } from './name-tag.component';

@NgModule({
  declarations: [NameTagComponent],
  imports: [CommonModule, MatTooltipModule, CommonPipeModule, RouterModule, SharedModule],
  exports: [NameTagComponent],
})
export class NameTagModule {}
