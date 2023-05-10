import { NgModule } from '@angular/core';
import { NumberDirective } from './number.directive';
import { BigNumberDirective } from './big-number.directive';



@NgModule({
  declarations: [
    NumberDirective,
    BigNumberDirective
  ],
  imports: [
  ],
  exports: [
    NumberDirective,
    BigNumberDirective
  ]
})
export class CommonDirectiveModule { }
