import { NgModule } from '@angular/core';
import { NumberDirective } from 'src/shared/directives/number.directive';



@NgModule({
  declarations: [
    NumberDirective
  ],
  imports: [
  ],
  exports: [
    NumberDirective
  ]
})
export class CommonDirectiveModule { }
