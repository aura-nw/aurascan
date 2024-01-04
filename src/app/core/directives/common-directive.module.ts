import { NgModule } from '@angular/core';
import { NumberDirective } from './number.directive';
import { BigNumberDirective } from './big-number.directive';
import { ImageDirective } from './image.directive';

@NgModule({
  declarations: [
    NumberDirective,
    BigNumberDirective,
    ImageDirective
  ],
  imports: [
  ],
  exports: [
    NumberDirective,
    BigNumberDirective,
    ImageDirective
  ]
})
export class CommonDirectiveModule { }
