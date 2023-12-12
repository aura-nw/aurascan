import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DateCustomPipe } from 'src/app/core/pipes/date-custom.pipe';
import { MarketInfoPipe } from 'src/app/core/pipes/market-info.pipe';
import { IsPrivateNameTagPipe, IsPublicNameTagPipe, NameTagPipe } from 'src/app/core/pipes/name-tag.pipe';
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
  FormatStringNumber,
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
    NameTagPipe,
    MarketInfoPipe,
    CheckDisplayTooltip,
    IsPublicNameTagPipe,
    IsPrivateNameTagPipe,
    DateCustomPipe,
    FormatStringNumber,
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
    MarketInfoPipe,
    CheckDisplayTooltip,
    IsPublicNameTagPipe,
    IsPrivateNameTagPipe,
    DateCustomPipe,
    FormatStringNumber,
  ],
})
export class CommonPipeModule {}
