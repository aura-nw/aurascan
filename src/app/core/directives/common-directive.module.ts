import { NgModule } from '@angular/core';
import { NumberDirective } from './number.directive';
import { BigNumberDirective } from './big-number.directive';
import { ImageDirective } from './image.directive';
import { FeatureDirective } from './feature.directive';

@NgModule({
  declarations: [NumberDirective, BigNumberDirective, ImageDirective, FeatureDirective],
  imports: [],
  exports: [NumberDirective, BigNumberDirective, ImageDirective, FeatureDirective],
})
export class CommonDirectiveModule {}
