import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { LoadingImageModule } from '../../loading-image/loading-image.module';
import { NameTagModule } from '../../name-tag/name-tag.module';
import { CardMobAccountComponent } from './card-mob-account.component';

@NgModule({
  declarations: [CardMobAccountComponent],
  imports: [
    CommonModule,
    RouterModule,
    CustomPipeModule,
    LoadingImageModule,
    CommonDirectiveModule,
    NameTagModule,
  ],
  exports: [CardMobAccountComponent],
})
export class CardMobAccountModule {}
