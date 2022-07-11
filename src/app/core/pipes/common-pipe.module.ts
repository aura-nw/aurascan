import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImageURL, pipeCalDate, PipeCutString } from './common.pipe';
import { JsonPipe } from './json.pipe';

@NgModule({
  declarations: [pipeCalDate, JsonPipe, PipeCutString, ImageURL],
  imports: [CommonModule],
  exports: [pipeCalDate, JsonPipe, PipeCutString, ImageURL],
})
export class CommonPipeModule {}
