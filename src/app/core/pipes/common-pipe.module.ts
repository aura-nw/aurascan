import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DateCustom } from 'src/app/core/pipes/date-custom.pipe';
import { FindUrlNameTag } from 'src/app/core/pipes/name-tag-find-url.pipe';
import { CheckPrivate } from 'src/app/core/pipes/name-tag-private.pipe';
import { CheckPublic } from 'src/app/core/pipes/name-tag-public.pipe';
import { nameTag } from 'src/app/core/pipes/name-tag.pipe';
import { CheckDisplayTooltip } from 'src/app/core/pipes/tooltip-display.pipe';
import {
  BalanceOf,
  convertLogAmount,
  convertSmallNumber,
  ConvertUauraToAura,
  CustomDate,
  decodeData,
  displayTypeToolTip,
  formatDigit,
  ImageURL,
  pipeCalDate,
  PipeCutString,
  ReplaceIpfs,
  StringEllipsis,
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
    nameTag,
    CheckDisplayTooltip,
    FindUrlNameTag,
    CheckPublic,
    CheckPrivate,
    DateCustom,
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
    nameTag,
    CheckDisplayTooltip,
    FindUrlNameTag,
    CheckPublic,
    CheckPrivate,
    DateCustom,
  ],
})
export class CommonPipeModule {}
