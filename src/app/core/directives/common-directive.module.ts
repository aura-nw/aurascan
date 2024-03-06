import { NgModule } from '@angular/core';
import { NumberDirective } from './number.directive';
import { BigNumberDirective } from './big-number.directive';
import { ImageDirective } from './image.directive';
import { FeatureDirective } from './feature.directive';
import { LinkDenomDirective } from './link-denom.directive';
import { CopyButtonDirective } from './copy-button.directive';
import { ExpandableContentDirective } from './expandable-content.directive';

@NgModule({
  declarations: [
    NumberDirective,
    BigNumberDirective,
    ImageDirective,
    FeatureDirective,
    LinkDenomDirective,
    CopyButtonDirective,
    ExpandableContentDirective,
  ],
  imports: [],
  exports: [
    NumberDirective,
    BigNumberDirective,
    ImageDirective,
    FeatureDirective,
    LinkDenomDirective,
    CopyButtonDirective,
    ExpandableContentDirective,
  ],
})
export class CommonDirectiveModule {}
