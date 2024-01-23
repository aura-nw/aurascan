import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { MaterialModule } from 'src/app/material.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { TooltipCustomizeModule } from 'src/app/shared/components/tooltip-customize/tooltip-customize.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PopupIBCDetailComponent } from './popup-ibc-detail.component';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';

@NgModule({
  declarations: [PopupIBCDetailComponent],
  imports: [
    SharedModule,
    CustomPipeModule,
    CommonModule,
    FormsModule,
    TableNoDataModule,
    PaginatorModule,
    TranslateModule,
    MaterialModule,
    NgbNavModule,
    NgxMaskDirective,
    NgxMaskPipe,
    CustomPipeModule,
    TooltipCustomizeModule,
    CommonDirectiveModule,
  ],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class PopupIBCDetailModule {}
