import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomDatePipe, DateCustomPipe } from './date.pipe';
import { ImageURLPipe, ReplaceIpfsPipe } from './image.pipe';
import { JsonPipe } from './json.pipe';
import { MarketInfoPipe } from './market-info.pipe';
import { IsPrivateNameTagPipe, IsPublicNameTagPipe, NameTagPipe } from './name-tag.pipe';
import { BalancePipe, ConvertLogAmountPipe, FormatDigitPipe, GtePipe, GtPipe, LtePipe, LtPipe } from './number.pipe';
import { CutStringPipe, StringEllipsisPipe } from './string.pipe';
import { CheckDisplayTooltip, DisplayTypeToolTipPipe } from './tooltip.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    JsonPipe,
    CutStringPipe,
    StringEllipsisPipe,
    ImageURLPipe,
    CustomDatePipe,
    ReplaceIpfsPipe,
    ConvertLogAmountPipe,
    DisplayTypeToolTipPipe,
    FormatDigitPipe,
    NameTagPipe,
    MarketInfoPipe,
    CheckDisplayTooltip,
    IsPublicNameTagPipe,
    IsPrivateNameTagPipe,
    DateCustomPipe,
    BalancePipe,
    GtePipe,
    LtePipe,
    GtPipe,
    LtPipe,
  ],
  exports: [
    JsonPipe,
    CutStringPipe,
    ImageURLPipe,
    CustomDatePipe,
    StringEllipsisPipe,
    ReplaceIpfsPipe,
    ConvertLogAmountPipe,
    DisplayTypeToolTipPipe,
    FormatDigitPipe,
    NameTagPipe,
    MarketInfoPipe,
    CheckDisplayTooltip,
    IsPublicNameTagPipe,
    IsPrivateNameTagPipe,
    DateCustomPipe,
    BalancePipe,
    GtePipe,
    LtePipe,
    GtPipe,
    LtPipe,
  ],
  providers: [],
})
export class CustomPipeModule {}
