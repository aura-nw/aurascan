import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SbImgComponent } from './sb-img/sb-img.component';
import { SoulboundFeatureTokensComponent } from './soulbound-feature-tokens.component';
import {MatTooltipModule} from "@angular/material/tooltip";

@NgModule({
  declarations: [SoulboundFeatureTokensComponent, SbImgComponent],
  imports: [CommonModule, MatTooltipModule],
  exports: [SoulboundFeatureTokensComponent],
})
export class SoulboundFeatureTokensModule {}
