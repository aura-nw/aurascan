import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DateCustomPipe } from 'src/app/core/pipes/date-custom.pipe';
import { IsPrivateNameTagPipe, IsPublicNameTagPipe, NameTagPipe } from 'src/app/core/pipes/name-tag.pipe';
import { CheckDisplayTooltip } from 'src/app/core/pipes/tooltip-display.pipe';
import {
  BalanceOf,
  ConvertUauraToAura,
  CustomDate,
  ImageURL,
  PipeCutString,
  ReplaceIpfs,
  StringEllipsis,
  convertLogAmount,
  convertSmallNumber,
  decodeData,
  displayTypeToolTip,
  formatDigit,
  pipeCalDate,
} from './common.pipe';
import { JsonPipe } from './json.pipe';

@NgModule({
  declarations: [
    pipeCalDate,
    JsonPipe,
    PipeCutString,
    ImageURL,
    CustomDate,
    StringEllipsis,
    BalanceOf,
    ReplaceIpfs,
    ConvertUauraToAura,
    convertLogAmount,
    decodeData,
    displayTypeToolTip,
    convertSmallNumber,
    formatDigit,
    NameTagPipe,
    CheckDisplayTooltip,
    IsPublicNameTagPipe,
    IsPrivateNameTagPipe,
    DateCustomPipe,
  ],
  imports: [CommonModule],
  exports: [
    pipeCalDate,
    JsonPipe,
    PipeCutString,
    ImageURL,
    CustomDate,
    StringEllipsis,
    BalanceOf,
    ReplaceIpfs,
    ConvertUauraToAura,
    convertLogAmount,
    decodeData,
    displayTypeToolTip,
    convertSmallNumber,
    formatDigit,
    NameTagPipe,
    CheckDisplayTooltip,
    IsPublicNameTagPipe,
    IsPrivateNameTagPipe,
    DateCustomPipe,
  ],
})
export class CommonPipeModule {}
