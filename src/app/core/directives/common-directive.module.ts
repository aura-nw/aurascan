import { NgModule } from '@angular/core';
import { NumberDirective } from './number.directive';
import { BigNumberDirective } from './big-number.directive';
import { LinkDenomDirective } from './link-denom.directive';

@NgModule({
  declarations: [
    NumberDirective,
    BigNumberDirective,
    LinkDenomDirective
  ],
  imports: [
  ],
  exports: [
    NumberDirective,
    BigNumberDirective,
    LinkDenomDirective
  ]
})
export class CommonDirectiveModule { }
