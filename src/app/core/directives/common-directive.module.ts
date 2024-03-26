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
import { MenuActiveDirective } from 'src/app/core/directives/menu-active.directive';

@NgModule({
  declarations: [
    NumberDirective,
    BigNumberDirective,
    ImageDirective,
    FeatureDirective,
    LinkDenomDirective,
    CopyButtonDirective,
    ExpandableContentDirective,
    TooltipCustomizeDirective,
    DragDropDirective,
    MenuActiveDirective,
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
    TooltipCustomizeDirective,
    DragDropDirective,
    MenuActiveDirective,
  ],
})
export class CommonDirectiveModule {}
