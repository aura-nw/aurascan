import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverComponent } from './popover.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    PopoverComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    PopoverComponent
  ]
})
export class PopoverModule { }
