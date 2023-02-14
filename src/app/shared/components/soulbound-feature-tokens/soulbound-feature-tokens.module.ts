import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoulboundFeatureTokensComponent } from './soulbound-feature-tokens.component';
import { CustomVideoPlayerModule } from '../custom-video-player/custom-video-player.module';
import { SbImgComponent } from './sb-img/sb-img.component';

@NgModule({
  declarations: [SoulboundFeatureTokensComponent, SbImgComponent],
  imports: [CommonModule, CustomVideoPlayerModule],
  exports: [SoulboundFeatureTokensComponent],
})
export class SoulboundFeatureTokensModule {}
