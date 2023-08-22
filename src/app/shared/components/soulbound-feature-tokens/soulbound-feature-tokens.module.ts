import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NftCardModule } from '../cards/nft-card/nft-card.module';
import { TooltipCustomizeModule } from '../tooltip-customize/tooltip-customize.module';
import { SbImgComponent } from './sb-img/sb-img.component';
import { SoulboundFeatureTokensComponent } from './soulbound-feature-tokens.component';
import { TableNoDataModule } from '../table-no-data/table-no-data.module';

@NgModule({
  declarations: [SoulboundFeatureTokensComponent, SbImgComponent],
  imports: [CommonModule, RouterModule, TooltipCustomizeModule, NftCardModule, TableNoDataModule],
  exports: [SoulboundFeatureTokensComponent],
})
export class SoulboundFeatureTokensModule {}
