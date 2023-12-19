import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DecodeDataPipe } from './common.pipe';
import { CustomDatePipe, DateCustomPipe } from './date-custom.pipe';
import { ImageURLPipe, ReplaceIpfsPipe } from './image.pipe';
import { JsonPipe } from './json.pipe';
import { MarketInfoPipe } from './market-info.pipe';
import { IsPrivateNameTagPipe, IsPublicNameTagPipe, NameTagPipe } from './name-tag.pipe';
import {
  BalanceOfPipe,
  ConvertLogAmountPipe,
  ConvertSmallNumberPipe,
  FormatDigitPipe,
  FormatStringNumberPipe,
} from './number.pipe';
import { CutStringPipe, StringEllipsisPipe } from './string.pipe';
import { CheckDisplayTooltip, DisplayTypeToolTipPipe } from './tooltip-display.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    JsonPipe,
    CutStringPipe,
    StringEllipsisPipe,
    ImageURLPipe,
    CustomDatePipe,
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
