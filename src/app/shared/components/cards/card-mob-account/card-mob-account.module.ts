import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { LoadingImageModule } from '../../loading-image/loading-image.module';
import { CardMobAccountComponent } from './card-mob-account.component';
import { NameTagModule } from '../../name-tag/name-tag.module';

@NgModule({
  declarations: [CardMobAccountComponent],
  imports: [CommonModule, RouterModule, CommonPipeModule, LoadingImageModule, CommonDirectiveModule, NameTagModule],
  exports: [CardMobAccountComponent],
})
export class CardMobAccountModule {}
