import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {EvmTransactionRoutingModule} from './evm-transaction-routing.module';
import {EvmTransactionComponent} from './evm-transaction.component';
import {EvmTransactionDetailComponent} from './evm-transaction-detail/evm-transaction-detail.component';
import {SharedModule} from "src/app/shared/shared.module";
import {TableNoDataModule} from "src/app/shared/components/table-no-data/table-no-data.module";
import {TranslateModule} from "@ngx-translate/core";
import {CustomPipeModule} from "src/app/core/pipes/custom-pipe.module";
import {MASK_CONFIG} from 'src/app/app.config';
import {NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask} from 'ngx-mask';
import {MaterialModule} from "src/app/material.module";
import {CommonDirectiveModule} from "src/app/core/directives/common-directive.module";


@NgModule({
  declarations: [
    EvmTransactionComponent,
    EvmTransactionDetailComponent
  ],
  imports: [
    CommonModule,
    EvmTransactionRoutingModule,
    SharedModule,
    TableNoDataModule,
    TranslateModule,
    NgxMaskDirective,
    NgxMaskPipe,
    MaterialModule,
    CommonDirectiveModule,
    CustomPipeModule
  ],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class EvmTransactionModule {
}
