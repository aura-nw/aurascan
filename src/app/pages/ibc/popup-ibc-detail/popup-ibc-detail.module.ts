import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { MaterialModule } from 'src/app/material.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { TooltipCustomizeModule } from 'src/app/shared/components/tooltip-customize/tooltip-customize.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PopupIBCDetailComponent } from './popup-ibc-detail.component';

@NgModule({
  declarations: [PopupIBCDetailComponent],
  imports: [
    SharedModule,
    CommonPipeModule,
    CommonModule,
    FormsModule,
    TableNoDataModule,
    PaginatorModule,
    TranslateModule,
    MaterialModule,
    NgbNavModule,
    NgxMaskDirective,
    NgxMaskPipe,
    CommonPipeModule,
    TooltipCustomizeModule,
  ],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class PopupIBCDetailModule {}