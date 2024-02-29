import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { TooltipCustomizeModule } from 'src/app/shared/components/tooltip-customize/tooltip-customize.module';
import { CustomPipeModule } from '../../core/pipes/custom-pipe.module';
import { MappingErrorService } from '../../core/services/mapping-error.service';
import { TransactionService } from '../../core/services/transaction.service';
import { MaterialModule } from '../../material.module';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { SharedModule } from '../../shared/shared.module';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { TransactionsComponent } from './transactions.component';

@NgModule({
  declarations: [TransactionsComponent],
  imports: [
    CommonModule,
    TransactionsRoutingModule,
    MaterialModule,
    NgxMaskDirective,
    NgxMaskPipe,
    CustomPipeModule,
    TranslateModule,
    SharedModule,
    TableNoDataModule,

    CommonDirectiveModule,

    TooltipCustomizeModule,
  ],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class TransactionsModule {}
