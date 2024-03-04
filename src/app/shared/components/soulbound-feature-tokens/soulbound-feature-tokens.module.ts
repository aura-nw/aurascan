import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { NftCardModule } from '../cards/nft-card/nft-card.module';
import { TableNoDataModule } from '../table-no-data/table-no-data.module';
import { SoulboundFeatureTokensComponent } from './soulbound-feature-tokens.component';

@NgModule({
  declarations: [SoulboundFeatureTokensComponent],
  imports: [
    CommonModule,
    RouterModule,
    NftCardModule,
    TableNoDataModule,
    CommonDirectiveModule,
  ],
  exports: [SoulboundFeatureTokensComponent],
})
export class SoulboundFeatureTokensModule {}
