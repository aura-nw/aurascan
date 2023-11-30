import { NgModule } from '@angular/core';
import { BigNumberDirective } from './big-number.directive';
import { FeatureDirective } from './feature.directive';
import { NumberDirective } from './number.directive';

@NgModule({
  declarations: [NumberDirective, BigNumberDirective, FeatureDirective],
  imports: [],
  exports: [NumberDirective, BigNumberDirective, FeatureDirective],
})
export class CommonDirectiveModule {}
