import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { MaterialModule } from 'src/app/material.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { EvmTransactionRoutingModule } from './evm-transactions-routing.module';
import { EvmTransactionsComponent } from './evm-transactions.component';
import { MatIconModule } from '@angular/material/icon';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';

@NgModule({
  declarations: [EvmTransactionsComponent],
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
    CustomPipeModule,
    MatIconModule,
    NameTagModule
  ],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class EvmTransactionsModule {}
