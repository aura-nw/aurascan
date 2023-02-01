import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaExpandComponent } from './media-expand.component';
import { AudioPlayerModule } from '../audio-player/audio-player.module';
import { ModelViewModule } from '../model-view/model-view.module';
import { CustomVideoPlayerModule } from '../custom-video-player/custom-video-player.module';

@NgModule({
  declarations: [MediaExpandComponent],
  imports: [CommonModule, AudioPlayerModule, ModelViewModule, AudioPlayerModule, CustomVideoPlayerModule],
})
export class MediaExpandModule {}
