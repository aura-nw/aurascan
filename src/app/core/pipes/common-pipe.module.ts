import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { pipeCalDate } from './common.pipe';


@NgModule({
  declarations: [
    pipeCalDate
  ],
  imports: [
    CommonModule
  ],
  exports: [
    pipeCalDate
  ]
})
export class CommonPipeModule { }
