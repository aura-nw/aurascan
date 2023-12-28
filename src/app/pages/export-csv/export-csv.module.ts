import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgxMaskPipe, provideEnvironmentNgxMask} from 'ngx-mask';
import {MASK_CONFIG} from 'src/app/app.config';
import {CustomPipeModule} from 'src/app/core/pipes/custom-pipe.module';
import {UserService} from 'src/app/core/services/user.service';
import {MaterialModule} from 'src/app/material.module';
import {TooltipCustomizeModule} from 'src/app/shared/components/tooltip-customize/tooltip-customize.module';
import {ExportCsvRoutingModule} from './export-csv-routing.module';
import {ExportCsvComponent} from './export-csv.component';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [ExportCsvComponent],
  imports: [
    ExportCsvRoutingModule,
    CustomPipeModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    CustomPipeModule,
    TooltipCustomizeModule,
    NgxMaskPipe,
    MaterialModule,
    TranslateModule,
  ],
  providers: [UserService, provideEnvironmentNgxMask(MASK_CONFIG)],
  exports: [ExportCsvComponent],
})
export class ExportCsvModule {
}
