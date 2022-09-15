import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { NgxMaskModule } from 'ngx-mask';
import { MaterialModule } from '../../../app/app.module';
import { CommonPipeModule } from '../../../app/core/pipes/common-pipe.module';
import { MappingErrorService } from '../../../app/core/services/mapping-error.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { SharedModule } from '../../../app/shared/shared.module';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { TransactionDetailComponent } from './transaction-detail/transaction-detail.component';
import { TransactionMessagesComponent } from './transaction-detail/transaction-messages/transaction-messages.component';
import { TransactionRoutingModule } from './transaction-routing.module';
import { TransactionComponent } from './transaction.component';
import {NgbNavModule} from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  declarations: [TransactionComponent, TransactionDetailComponent, TransactionMessagesComponent],
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
        NgxJsonViewerModule,
        TableNoDataModule,
        CommonPipeModule,
        NgbNavModule
    ],
  providers: [TransactionService, MappingErrorService],
})
export class TransactionModule {}
