import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { MaterialModule } from 'src/app/material.module';
import { CommonPipeModule } from '../../../core/pipes/common-pipe.module';
import { TableNoDataModule } from '../../../shared/components/table-no-data/table-no-data.module';
import { PopupDelegateComponent } from './popup-delegate.component';

@NgModule({
  declarations: [PopupDelegateComponent],
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    CommonPipeModule,
    RouterModule,
    TableNoDataModule,
    FormsModule,
    NgxMaskPipe,
  ],
  exports: [PopupDelegateComponent],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class PopupDelegateModule {}
