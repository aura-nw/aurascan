import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioPlayerComponent } from './audio-player.component';

@NgModule({
  imports: [CommonModule],
  declarations: [AudioPlayerComponent],
  exports: [AudioPlayerComponent],
})
export class AudioPlayerModule {}
