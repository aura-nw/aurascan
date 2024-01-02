import { NgModule } from '@angular/core';
import { BigNumberDirective } from './big-number.directive';
import { FeatureDirective } from './feature.directive';
import { ImageDirective } from './image.directive';
import { NumberDirective } from './number.directive';

@NgModule({
  declarations: [NumberDirective, BigNumberDirective, FeatureDirective, ImageDirective],
  imports: [],
  exports: [NumberDirective, BigNumberDirective, FeatureDirective, ImageDirective],
})
export class CommonDirectiveModule {}
