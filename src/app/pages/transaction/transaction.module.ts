import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionComponent } from './transaction.component';
import { TransactionRoutingModule } from './transaction-routing.module';
import { MaterialModule } from '../../../app/app.module';
import { NgxMaskModule } from 'ngx-mask';
import { CommonPipeModule } from '../../../app/core/pipes/common-pipe.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../app/shared/shared.module';
import { TxsDetailComponent } from './txs-detail/txs-detail.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { TransferredDetailComponent } from './txs-detail/transferred-detail/transferred-detail.component';
import { TableNoDataModule } from '../../../app/shared/table-no-data/table-no-data.module';
import { ValidatorService } from '../../../app/core/services/validator.service';
import { MappingErrorService } from '../../../app/core/services/mapping-error.service';

@NgModule({
  declarations: [
    TransactionComponent,
    TxsDetailComponent,
    TransferredDetailComponent
  ],
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
    TableNoDataModule
  ],
  providers: [TransactionService, ValidatorService, MappingErrorService]
})
export class TransactionModule { }
