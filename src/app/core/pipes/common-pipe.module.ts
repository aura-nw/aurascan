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
  ConvertUauraToAura,
  convertLogAmount,
  decodeData,
  displayTypeToolTip,
  convertSmallNumber,
  formatDigit,
} from './common.pipe';
import { JsonPipe } from './json.pipe';
import {nameTag} from "src/app/core/pipes/name-tag.pipe";
import {CheckDisplayTooltip} from "src/app/core/pipes/tooltip-display.pipe";
import {FindUrlNameTag} from "src/app/core/pipes/name-tag-find-url.pipe";
import {CheckPublic} from "src/app/core/pipes/name-tag-public.pipe";
import {CheckPrivate} from "src/app/core/pipes/name-tag-private.pipe";
import {DateCustom} from "src/app/core/pipes/date-custom.pipe";

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
