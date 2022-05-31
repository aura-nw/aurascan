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
import { ValidatorService } from '../../../app/core/services/validator.service';
import { SharedModule } from '../../../app/shared/shared.module';
import { PaginatorModule } from '../../shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { ContractDetailComponent } from './contract-detail/contract-detail.component';
import { ContractMessagesComponent } from './contract-detail/contract-messages/contract-messages.component';
import { ContractRoutingModule } from './contract-routing.module';
import { ContractComponent } from './contract.component';

@NgModule({
  declarations: [ContractComponent, ContractDetailComponent, ContractMessagesComponent],
  imports: [
    CommonModule,
    ContractRoutingModule,
    MaterialModule,
    NgxMaskModule,
    CommonPipeModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    NgxJsonViewerModule,
    TableNoDataModule,
    PaginatorModule,
  ],
  providers: [TransactionService, ValidatorService, MappingErrorService],
})
export class ContractModule {}
