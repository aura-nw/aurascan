import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    DropdownComponent
  ],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [
    DropdownComponent
  ]
})
export class DropdownModule { }
