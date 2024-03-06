import { NgModule } from '@angular/core';
import { NumberDirective } from './number.directive';
import { BigNumberDirective } from './big-number.directive';
import { ImageDirective } from './image.directive';
import { FeatureDirective } from './feature.directive';
import { LinkDenomDirective } from './link-denom.directive';
import { CopyButtonDirective } from './copy-button.directive';
import { TooltipCustomizeDirective } from 'src/app/core/directives/tooltip-customize.directive';

@NgModule({
  declarations: [
    NumberDirective,
    BigNumberDirective,
    ImageDirective,
    FeatureDirective,
    LinkDenomDirective,
    CopyButtonDirective,
    TooltipCustomizeDirective,
  ],
  imports: [],
  exports: [
    NumberDirective,
    BigNumberDirective,
    ImageDirective,
    FeatureDirective,
    LinkDenomDirective,
    CopyButtonDirective,
    TooltipCustomizeDirective,
  ],
})
export class CommonDirectiveModule {}
