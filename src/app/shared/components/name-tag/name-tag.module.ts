import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { NameTagComponent } from './name-tag.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [NameTagComponent],
  imports: [CommonModule, MatTooltipModule, CommonPipeModule, RouterModule],
  exports: [NameTagComponent],
})
export class NameTagModule {}
