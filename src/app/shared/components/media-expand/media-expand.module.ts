import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AudioPlayerModule } from '../audio-player/audio-player.module';
import { ModelViewModule } from '../model-view/model-view.module';
import { MediaExpandComponent } from './media-expand.component';

@NgModule({
  declarations: [MediaExpandComponent],
  imports: [CommonModule, AudioPlayerModule, ModelViewModule, AudioPlayerModule],
})
export class MediaExpandModule {}
