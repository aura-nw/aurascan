import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { pipeCalDate } from './common.pipe';
import { JsonPipe } from './json.pipe';


@NgModule({
  declarations: [
    pipeCalDate,
    JsonPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    pipeCalDate,
    JsonPipe
  ]
})
export class CommonPipeModule { }
