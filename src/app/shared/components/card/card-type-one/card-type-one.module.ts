import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { CardTypeOneComponent } from './card-type-one.component';

@NgModule({
  declarations: [
    CardTypeOneComponent
  ],
  imports: [
    CommonPipeModule,
    CommonModule,
    RouterModule
  ],
  exports: [
    CardTypeOneComponent
  ]
})
export class CardTypeOneModule { }