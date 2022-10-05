import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomVideoPlayerComponent } from './custom-video-player.component';

@NgModule({
  declarations: [CustomVideoPlayerComponent],
  imports: [CommonModule],
  exports: [CustomVideoPlayerComponent],
})
export class CustomVideoPlayerModule {}
