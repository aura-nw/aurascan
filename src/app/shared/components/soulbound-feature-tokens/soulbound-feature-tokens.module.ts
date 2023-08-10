import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TooltipCustomizeModule } from '../tooltip-customize/tooltip-customize.module';
import { SbImgComponent } from './sb-img/sb-img.component';
import { SoulboundFeatureTokensComponent } from './soulbound-feature-tokens.component';

@NgModule({
  declarations: [SoulboundFeatureTokensComponent, SbImgComponent],
  imports: [CommonModule, RouterModule, TooltipCustomizeModule],
  exports: [SoulboundFeatureTokensComponent],
})
export class SoulboundFeatureTokensModule {}
