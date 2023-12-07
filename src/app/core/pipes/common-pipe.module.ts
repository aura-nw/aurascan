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
import {MarketInfo} from "src/app/core/pipes/market-info.pipe";

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
    MarketInfo
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
    MarketInfo
  ],
})
export class CommonPipeModule {}
