import {NgModule} from '@angular/core';
import {NumberDirective} from './number.directive';
import {BigNumberDirective} from './big-number.directive';
import {LinkDenomDirective} from './link-denom.directive';
import {CopyButtonDirective} from "src/app/core/directives/copy-button.directive";

@NgModule({
  declarations: [
    NumberDirective,
    BigNumberDirective,
    LinkDenomDirective,
    CopyButtonDirective
  ],
  imports: [],
  exports: [
    NumberDirective,
    BigNumberDirective,
    LinkDenomDirective,
    CopyButtonDirective
  ]
})
export class CommonDirectiveModule {
}
