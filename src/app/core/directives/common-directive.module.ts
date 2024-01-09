import { NgModule } from '@angular/core';
import { NumberDirective } from './number.directive';
import { BigNumberDirective } from './big-number.directive';
import { ImageDirective } from './image.directive';
import { FeatureDirective } from './feature.directive';
import { LinkDenomDirective } from './link-denom.directive';

@NgModule({
  declarations: [NumberDirective, BigNumberDirective, ImageDirective, FeatureDirective, LinkDenomDirective],
  imports: [],
  exports: [NumberDirective, BigNumberDirective, ImageDirective, FeatureDirective, LinkDenomDirective],
})
export class CommonDirectiveModule {}
