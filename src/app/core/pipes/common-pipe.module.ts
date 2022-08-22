import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {CustomDate, ImageURL, pipeCalDate, PipeCutString, StringEllipsis} from './common.pipe';
import { JsonPipe } from './json.pipe';

@NgModule({
  declarations: [pipeCalDate, JsonPipe, PipeCutString, ImageURL, CustomDate, StringEllipsis],
  imports: [CommonModule],
  exports: [pipeCalDate, JsonPipe, PipeCutString, ImageURL, CustomDate, StringEllipsis],
})
export class CommonPipeModule {}
