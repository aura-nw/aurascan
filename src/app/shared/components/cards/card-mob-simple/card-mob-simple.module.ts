import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { LoadingImageModule } from '../../loading-image/loading-image.module';
import { CardMobSimpleComponent } from './card-mob-simple.component';

@NgModule({
  declarations: [CardMobSimpleComponent],
  imports: [CommonModule, RouterModule, CommonPipeModule, LoadingImageModule, CommonDirectiveModule],
  exports: [CardMobSimpleComponent],
})
export class CardMobSimpleModule {}
