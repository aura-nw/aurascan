import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { LoadingImageModule } from '../../loading-image/loading-image.module';
import { CardMobSimpleComponent } from './card-mob-simple.component';

@NgModule({
  declarations: [CardMobSimpleComponent],
  imports: [CommonModule, RouterModule, CustomPipeModule, LoadingImageModule, CommonDirectiveModule, TranslateModule],
  exports: [CardMobSimpleComponent],
})
export class CardMobSimpleModule {}
