import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingImageComponent } from './loading-image.component';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';

@NgModule({
  declarations: [LoadingImageComponent],
  imports: [CommonModule, CustomPipeModule],
  exports: [LoadingImageComponent],
})
export class LoadingImageModule {}
