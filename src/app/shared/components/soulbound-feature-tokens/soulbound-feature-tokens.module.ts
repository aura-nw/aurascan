import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoulboundFeatureTokensComponent } from './soulbound-feature-tokens.component';
import { CustomVideoPlayerModule } from '../custom-video-player/custom-video-player.module';

@NgModule({
  declarations: [SoulboundFeatureTokensComponent],
  imports: [CommonModule, CustomVideoPlayerModule],
  exports: [SoulboundFeatureTokensComponent],
})
export class SoulboundFeatureTokensModule {}
