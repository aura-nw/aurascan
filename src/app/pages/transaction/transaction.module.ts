import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { TooltipCustomizeModule } from 'src/app/shared/components/tooltip-customize/tooltip-customize.module';
import { CustomPipeModule } from '../../core/pipes/custom-pipe.module';
import { MappingErrorService } from '../../core/services/mapping-error.service';
import { TransactionService } from '../../core/services/transaction.service';
import { MaterialModule } from '../../material.module';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { SharedModule } from '../../shared/shared.module';
import { AuraTransactionComponent } from './aura-transaction/aura-transaction.component';
import { TokenTransferComponent } from './token-transfer/token-transfer.component';
import { MessagesItemComponent } from './transaction-messages/messages-item/messages-item.component';
import { TransactionMessagesComponent } from './transaction-messages/transaction-messages.component';
import { TransactionRoutingModule } from './transaction-routing.module';
import { TransactionComponent } from './transaction.component';

@NgModule({
  declarations: [
    TransactionComponent,
    TransactionMessagesComponent,
    MessagesItemComponent,
    TokenTransferComponent,
    AuraTransactionComponent,
  ],
  imports: [
    CommonModule,
    TransactionRoutingModule,
    MaterialModule,
    NgxMaskDirective,
    NgxMaskPipe,
    CustomPipeModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    TableNoDataModule,
    CustomPipeModule,
    NgbNavModule,
    NgxJsonViewerModule,
    CommonDirectiveModule,
    NameTagModule,
    TooltipCustomizeModule,
    ClipboardModule,
  ],
  providers: [TransactionService, MappingErrorService, ProposalService, provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class TransactionModule {}
