import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { LoadingImageModule } from '../../loading-image/loading-image.module';
import { CardMobSimpleComponent } from './card-mob-simple.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [CardMobSimpleComponent],
  imports: [CommonModule, RouterModule, CustomPipeModule, LoadingImageModule, CommonDirectiveModule],
  exports: [CardMobSimpleComponent],
})
export class CardMobSimpleModule {}
