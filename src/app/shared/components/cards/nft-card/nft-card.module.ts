import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask';
import { AudioPlayerModule } from '../../audio-player/audio-player.module';
import { CustomVideoPlayerModule } from '../../custom-video-player/custom-video-player.module';
import { ModelViewModule } from '../../model-view/model-view.module';
import { NftCardComponent } from './nft-card.component';

@NgModule({
  declarations: [NftCardComponent],
  imports: [CommonModule, RouterModule, NgxMaskModule, CustomVideoPlayerModule, ModelViewModule, AudioPlayerModule],
  exports: [NftCardComponent],
})
export class NftCardModule {}
