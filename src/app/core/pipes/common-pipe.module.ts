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
  CustomDatePipe,
  CutStringPipe,
  DecodeDataPipe,
  DisplayTypeToolTipPipe,
  FormatDigitPipe,
  FormatStringNumberPipe,
  ImageURLPipe,
  ReplaceIpfsPipe,
  StringEllipsisPipe,
} from './common.pipe';
import { JsonPipe } from './json.pipe';

@NgModule({
  declarations: [
    JsonPipe,
    CutStringPipe,
    ImageURLPipe,
    CustomDatePipe,
    StringEllipsisPipe,
    BalanceOfPipe,
    ReplaceIpfsPipe,
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
    JsonPipe,
    CutStringPipe,
    ImageURLPipe,
    CustomDatePipe,
    StringEllipsisPipe,
    BalanceOfPipe,
    ReplaceIpfsPipe,
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
