import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { MaterialModule } from 'src/app/material.module';
import { CustomPipeModule } from '../../../core/pipes/custom-pipe.module';
import { TableNoDataModule } from '../../../shared/components/table-no-data/table-no-data.module';
import { PopupDelegateComponent } from './popup-delegate.component';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';

@NgModule({
  declarations: [PopupDelegateComponent],
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    CustomPipeModule,
    RouterModule,
    TableNoDataModule,
    FormsModule,
    NgxMaskPipe,
    CommonDirectiveModule
  ],
  exports: [PopupDelegateComponent],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class PopupDelegateModule {}
