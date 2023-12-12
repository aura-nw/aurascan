import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DateCustomPipe } from 'src/app/core/pipes/date-custom.pipe';
import { MarketInfoPipe } from 'src/app/core/pipes/market-info.pipe';
import { IsPrivateNameTagPipe, IsPublicNameTagPipe, NameTagPipe } from 'src/app/core/pipes/name-tag.pipe';
import { CheckDisplayTooltip } from 'src/app/core/pipes/tooltip-display.pipe';
import {
  BalanceOfPipe,
  ConvertLogAmountPipe,
  ConvertSmallNumberPipe,
  ConvertUauraToAuraPipe,
  CustomDatePipe,
  DecodeDataPipe,
  DisplayTypeToolTipPipe,
  FormatDigitPipe,
  FormatStringNumberPipe,
  ImageURLPipe,
  CalDatePipe,
  CutStringPipe,
  ReplaceIpfsPipe,
  StringEllipsisPipe,
} from './common.pipe';
import { JsonPipe } from './json.pipe';

@NgModule({
  declarations: [
    CalDatePipe,
    JsonPipe,
    CutStringPipe,
    ImageURLPipe,
    CustomDatePipe,
    StringEllipsisPipe,
    BalanceOfPipe,
    ReplaceIpfsPipe,
    ConvertUauraToAuraPipe,
    ConvertLogAmountPipe,
    DecodeDataPipe,
    DisplayTypeToolTipPipe,
    ConvertSmallNumberPipe,
    FormatDigitPipe,
    NameTagPipe,
    MarketInfoPipe,
    CheckDisplayTooltip,
    IsPublicNameTagPipe,
    IsPrivateNameTagPipe,
    DateCustomPipe,
    FormatStringNumberPipe,
  ],
  imports: [CommonModule],
  exports: [
    CalDatePipe,
    JsonPipe,
    CutStringPipe,
    ImageURLPipe,
    CustomDatePipe,
    StringEllipsisPipe,
    BalanceOfPipe,
    ReplaceIpfsPipe,
    ConvertUauraToAuraPipe,
    ConvertLogAmountPipe,
    DecodeDataPipe,
    DisplayTypeToolTipPipe,
    ConvertSmallNumberPipe,
    FormatDigitPipe,
    NameTagPipe,
    MarketInfoPipe,
    CheckDisplayTooltip,
    IsPublicNameTagPipe,
    IsPrivateNameTagPipe,
    DateCustomPipe,
    FormatStringNumberPipe,
  ],
})
export class CommonPipeModule {}
