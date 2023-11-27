import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { AudioPlayerModule } from '../../audio-player/audio-player.module';
import { ModelViewModule } from '../../model-view/model-view.module';
import { NftCardComponent } from './nft-card.component';
import { MASK_CONFIG } from 'src/app/app.config';

@NgModule({
  declarations: [NftCardComponent],
  imports: [CommonModule, RouterModule, NgxMaskDirective, NgxMaskPipe, ModelViewModule, AudioPlayerModule],
  exports: [NftCardComponent],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class NftCardModule {}
