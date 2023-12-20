import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { MaterialModule } from 'src/app/material.module';
import { LoadingImageModule } from 'src/app/shared/components/loading-image/loading-image.module';
import { TooltipCustomizeModule } from 'src/app/shared/components/tooltip-customize/tooltip-customize.module';
import { CustomPipeModule } from '../../../../core/pipes/custom-pipe.module';
import { PaginatorModule } from '../../../../shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../../../shared/components/table-no-data/table-no-data.module';
import { AccountDetailTableComponent } from './account-detail-table.component';

@NgModule({
  declarations: [AccountDetailTableComponent],
  imports: [
    CommonModule,
    TranslateModule,
    CustomPipeModule,
    RouterModule,
    TableNoDataModule,
    PaginatorModule,
    LoadingImageModule,
    NgxMaskPipe,
    NgxMaskDirective,
    CommonDirectiveModule,
    MaterialModule,
    TooltipCustomizeModule,
  ],
  exports: [AccountDetailTableComponent],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class AccountDetailTableModule {}
