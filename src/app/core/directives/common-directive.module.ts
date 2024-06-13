import { NgModule } from '@angular/core';
import { NumberDirective } from './number.directive';
import { BigNumberDirective } from './big-number.directive';
import { ImageDirective } from './image.directive';
import { FeatureDirective } from './feature.directive';
import { LinkDenomDirective } from './link-denom.directive';
import { CopyButtonDirective } from './copy-button.directive';
import { ExpandableContentDirective } from './expandable-content.directive';
import { TooltipCustomizeDirective } from 'src/app/core/directives/tooltip-customize.directive';
import { DragDropDirective } from './drag-drop.directive';
import { RouterLinkActiveMenuDirective } from './routerLinkActiveMenu.directive';
import { FeatureFlagDirective } from './feature-flag.directive';

@NgModule({
  declarations: [
    NumberDirective,
    BigNumberDirective,
    ImageDirective,
    FeatureDirective,
    FeatureFlagDirective,
    LinkDenomDirective,
    CopyButtonDirective,
    ExpandableContentDirective,
    TooltipCustomizeDirective,
    DragDropDirective,
    RouterLinkActiveMenuDirective,
  ],
  imports: [],
  exports: [
    NumberDirective,
    BigNumberDirective,
    ImageDirective,
    FeatureDirective,
    FeatureFlagDirective,
    LinkDenomDirective,
    CopyButtonDirective,
    ExpandableContentDirective,
    TooltipCustomizeDirective,
    DragDropDirective,
    RouterLinkActiveMenuDirective,
  ],
})
export class CommonDirectiveModule {}
