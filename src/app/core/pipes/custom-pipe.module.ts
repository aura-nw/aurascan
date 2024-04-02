import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DecodeDataPipe } from './coded.pipe';
import { CustomTimeDatePipe } from './date.pipe';
import { ImageURLPipe, ReplaceIpfsPipe } from './image.pipe';
import { JsonPipe } from './json.pipe';
import { IbcDenomPipe, MarketInfoPipe } from './market-info.pipe';
import { IsPrivateNameTagPipe, IsPublicNameTagPipe, NameTagPipe } from './name-tag.pipe';
import { BalancePipe, FormatDigitPipe, GtePipe, GtPipe, LtePipe, LtPipe } from './number.pipe';
import { CombineTxsMsgPipe, EllipsisPipe } from './string.pipe';
import { NameTagTooltipPipe } from './tooltip.pipe';
import { IsContractPipe } from './address.pipe';
import { ObjectKeysPipe } from './object-keys.pipe';
import { CapacityPipe } from './capacity.pipe';
import { ConvertEvmTxPipe } from './evm.pipe';
import { EvmAddressPipe } from './evm-address.pipe';

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
    IbcDenomPipe,
    EllipsisPipe,
    CustomTimeDatePipe,
    DecodeDataPipe,
    IsContractPipe,
    ObjectKeysPipe,
    CapacityPipe,
    ConvertEvmTxPipe,
    EvmAddressPipe,
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
    IbcDenomPipe,
    EllipsisPipe,
    CustomTimeDatePipe,
    DecodeDataPipe,
    IsContractPipe,
    ObjectKeysPipe,
    CapacityPipe,
    ConvertEvmTxPipe,
    EvmAddressPipe,
  ],
  providers: [],
})
export class CustomPipeModule {}
