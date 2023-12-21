import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomDatePipe, DateCustomPipe } from './date.pipe';
import { ImageURLPipe, ReplaceIpfsPipe } from './image.pipe';
import { JsonPipe } from './json.pipe';
import { IbcDenomPipe, MarketInfoPipe } from './market-info.pipe';
import { IsPrivateNameTagPipe, IsPublicNameTagPipe, NameTagPipe } from './name-tag.pipe';
import { BalancePipe, FormatDigitPipe, GtePipe, GtPipe, LtePipe, LtPipe } from './number.pipe';
import { EllipsisPipe } from './string.pipe';
import { CheckDisplayTooltip, DisplayTypeToolTipPipe } from './tooltip.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    JsonPipe,
    ImageURLPipe,
    CustomDatePipe,
    ReplaceIpfsPipe,
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
    IbcDenomPipe,
    EllipsisPipe,
  ],
  exports: [
    JsonPipe,
    ImageURLPipe,
    CustomDatePipe,
    ReplaceIpfsPipe,
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
    IbcDenomPipe,
    EllipsisPipe,
  ],
  providers: [],
})
export class CustomPipeModule {}
