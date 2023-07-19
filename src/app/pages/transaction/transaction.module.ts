import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { MaskPipe, NgxMaskModule } from 'ngx-mask';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { TooltipCustomizeModule } from 'src/app/shared/components/tooltip-customize/tooltip-customize.module';
import { MaterialModule } from '../../../app/app.module';
import { CommonPipeModule } from '../../../app/core/pipes/common-pipe.module';
import { MappingErrorService } from '../../../app/core/services/mapping-error.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { SharedModule } from '../../../app/shared/shared.module';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { TransactionDetailComponent } from './transaction-detail/transaction-detail.component';
import { MessagesItemComponent } from './transaction-detail/transaction-messages/messages-item/messages-item.component';
import { TransactionMessagesComponent } from './transaction-detail/transaction-messages/transaction-messages.component';
import { TransactionRoutingModule } from './transaction-routing.module';
import { TransactionComponent } from './transaction.component';
import {ClipboardModule} from '@angular/cdk/clipboard';

@NgModule({
  declarations: [TransactionComponent, TransactionDetailComponent, TransactionMessagesComponent, MessagesItemComponent],
  imports: [
    CommonModule,
    TransactionRoutingModule,
    MaterialModule,
    NgxMaskModule,
    CommonPipeModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    TableNoDataModule,
    CommonPipeModule,
    NgbNavModule,
    NgxJsonViewerModule,
    CommonDirectiveModule,
    NameTagModule,
    TooltipCustomizeModule,
    ClipboardModule
  ],
  providers: [TransactionService, MappingErrorService, ProposalService, MaskPipe],
})
export class TransactionModule {}
