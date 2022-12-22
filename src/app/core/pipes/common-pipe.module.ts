import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  BalanceOf,
  CustomDate,
  ImageURL,
  pipeCalDate,
  PipeCutString,
  StringEllipsis,
  ReplaceIpfs,
} from './common.pipe';
import { JsonPipe } from './json.pipe';

@NgModule({
  declarations: [pipeCalDate, JsonPipe, PipeCutString, ImageURL, CustomDate, StringEllipsis, BalanceOf, ReplaceIpfs],
  imports: [CommonModule],
  exports: [pipeCalDate, JsonPipe, PipeCutString, ImageURL, CustomDate, StringEllipsis, BalanceOf, ReplaceIpfs],
})
export class CommonPipeModule {}
