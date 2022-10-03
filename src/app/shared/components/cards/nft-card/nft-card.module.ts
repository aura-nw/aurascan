import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask';
import { CustomVideoPlayerModule } from '../../custom-video-player/custom-video-player.module';
import { ModelViewModule } from '../../model-view/model-view.module';
import { NftCardComponent } from './nft-card.component';

@NgModule({
  declarations: [NftCardComponent],
  imports: [CommonModule, RouterModule, NgxMaskModule, CustomVideoPlayerModule, ModelViewModule],
  exports: [NftCardComponent],
})
export class NftCardModule {}
