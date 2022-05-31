import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { pipeCalDate, PipeCutString } from './common.pipe';
import { JsonPipe } from './json.pipe';

@NgModule({
  declarations: [pipeCalDate, JsonPipe, PipeCutString],
  imports: [CommonModule],
  exports: [pipeCalDate, JsonPipe, PipeCutString],
})
export class CommonPipeModule {}
