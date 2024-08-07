import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IsContractPipe } from './address.pipe';
import { CapacityPipe } from './capacity.pipe';
import { DecodeDataPipe } from './coded.pipe';
import { CustomTimeDatePipe } from './date.pipe';
import { EvmAddressPipe } from './evm-address.pipe';
import { ImageURLPipe, ReplaceIpfsPipe } from './image.pipe';
import { JsonPipe } from './json.pipe';
import { IbcDenomPipe, MarketInfoPipe } from './market-info.pipe';
import { IsPrivateNameTagPipe, IsPublicNameTagPipe, NameTagPipe } from './name-tag.pipe';
import { BalancePipe, EqPipe, FormatDigitPipe, GtPipe, GtePipe, LtPipe, LtePipe } from './number.pipe';
import { ObjectKeysPipe } from './object-keys.pipe';
import { CombineTxsMsgPipe, EllipsisPipe } from './string.pipe';
import { NameTagTooltipPipe } from './tooltip.pipe';
import { HighlightFunctionPipe } from './highlight-function.pipe';
import { NewlinePipe } from './newline.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    JsonPipe,
    ImageURLPipe,
    ReplaceIpfsPipe,
    CombineTxsMsgPipe,
    FormatDigitPipe,
    NameTagPipe,
    MarketInfoPipe,
    NameTagTooltipPipe,
    IsPublicNameTagPipe,
    IsPrivateNameTagPipe,
    BalancePipe,
    GtePipe,
    LtePipe,
    GtPipe,
    LtPipe,
    EqPipe,
    IbcDenomPipe,
    EllipsisPipe,
    CustomTimeDatePipe,
    DecodeDataPipe,
    IsContractPipe,
    ObjectKeysPipe,
    CapacityPipe,
    EvmAddressPipe,
    HighlightFunctionPipe,
    NewlinePipe
  ],
  exports: [
    JsonPipe,
    ImageURLPipe,
    ReplaceIpfsPipe,
    CombineTxsMsgPipe,
    FormatDigitPipe,
    NameTagPipe,
    MarketInfoPipe,
    NameTagTooltipPipe,
    IsPublicNameTagPipe,
    IsPrivateNameTagPipe,
    BalancePipe,
    GtePipe,
    LtePipe,
    GtPipe,
    LtPipe,
    EqPipe,
    IbcDenomPipe,
    EllipsisPipe,
    CustomTimeDatePipe,
    DecodeDataPipe,
    IsContractPipe,
    ObjectKeysPipe,
    CapacityPipe,
    EvmAddressPipe,
    HighlightFunctionPipe,
    NewlinePipe
  ],
  providers: [],
})
export class CustomPipeModule {}

