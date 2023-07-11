import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { SharedModule } from '../../shared.module';
import { NameTagComponent } from './name-tag.component';

@NgModule({
  declarations: [NameTagComponent],
  imports: [CommonModule, CommonPipeModule, RouterModule, SharedModule],
  exports: [NameTagComponent],
})
export class NameTagModule {}
