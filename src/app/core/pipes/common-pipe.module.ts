import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {DateCustomPipe} from 'src/app/core/pipes/date-custom.pipe';
import {IsPrivateNameTagPipe, IsPublicNameTagPipe, NameTagPipe} from 'src/app/core/pipes/name-tag.pipe';
import {CheckDisplayTooltip} from 'src/app/core/pipes/tooltip-display.pipe';
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
  pipeCalDate, convertStringNumber,
} from './common.pipe';
import {JsonPipe} from './json.pipe';
import {MarketInfoPipe} from 'src/app/core/pipes/market-info.pipe';

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
    convertStringNumber
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
    convertStringNumber
  ],
})
export class CommonPipeModule {
}
