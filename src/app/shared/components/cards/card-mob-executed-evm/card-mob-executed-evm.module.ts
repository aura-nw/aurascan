import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { LoadingImageModule } from '../../loading-image/loading-image.module';
import { NameTagModule } from '../../name-tag/name-tag.module';
import { CardMobExecutedEvmComponent } from './card-mob-executed-evm.component';
import { MaterialModule } from 'src/app/material.module';

@NgModule({
  declarations: [CardMobExecutedEvmComponent],
  imports: [CommonModule, RouterModule, CustomPipeModule, LoadingImageModule, CommonDirectiveModule, NameTagModule, MaterialModule],
  exports: [CardMobExecutedEvmComponent],
})
export class CardMobExecutedEvmModule {}
