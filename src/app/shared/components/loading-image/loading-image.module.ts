import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingImageComponent } from './loading-image.component';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';

@NgModule({
  declarations: [LoadingImageComponent],
  imports: [CommonModule, CommonPipeModule],
  exports: [LoadingImageComponent],
})
export class LoadingImageModule {}
