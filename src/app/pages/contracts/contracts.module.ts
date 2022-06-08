import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DateFnsModule } from 'ngx-date-fns';
import { NgxMaskModule } from 'ngx-mask';
import { MaterialModule } from 'src/app/app.module';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { ContractContentComponent } from 'src/app/pages/contracts/contracts-detail/contracts-informations/contract-content.component';
import { ReadContractComponent } from 'src/app/pages/contracts/contracts-detail/contracts-informations/info-tab/contract/read-contract/read-contract.component';
import { WriteContractComponent } from 'src/app/pages/contracts/contracts-detail/contracts-informations/info-tab/contract/write-contact/write-contract.component';
import { ContractsListComponent } from 'src/app/pages/contracts/contracts-list/contracts-list.component';
import { ContractsRoutingModule } from 'src/app/pages/contracts/contracts-routing.module';
import { ContractsTransactionsComponent } from 'src/app/pages/contracts/contracts-transactions/contracts-transactions.component';
import { DropdownModule } from 'src/app/shared/components/dropdown/dropdown.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { ContractTableModule } from 'src/app/shared/components/contract-table/contract-table.module';
import { ContractService } from '../../core/services/contract.service';
import { ContractInfoCardComponent } from './contracts-detail/contract-info-card/contract-info-card.component';
import { ContractsDetailComponent } from './contracts-detail/contracts-detail.component';
import { Cw20TokenComponent } from './contracts-detail/contracts-informations/info-tab/cw20-token/cw20-token.component';
import { ContractComponent } from './contracts-detail/contracts-informations/info-tab/contract/contract.component';
import { ContractsOverviewCardComponent } from './contracts-detail/contracts-overview-card/contracts-overview-card.component';
import { CodeContractComponent } from './contracts-detail/contracts-informations/info-tab/contract/contract-code/code-contract.component';
import {ContractsVerifyComponent} from "./contracts-verify/contracts-verify.component";
import { ReactiveFormsModule } from '@angular/forms';
import { CompilerOutputComponent } from './contracts-verify/compiler-output/compiler-output.component';
import { QrModule } from 'src/app/shared/components/qr/qr.module';

@NgModule({
  declarations: [
    ContractContentComponent,
    ReadContractComponent,
    ContractsListComponent,
    ContractsTransactionsComponent,
    WriteContractComponent,
    ContractInfoCardComponent,
    ContractsDetailComponent,
    ContractsOverviewCardComponent,
    Cw20TokenComponent,
    ContractComponent,
    CodeContractComponent,
    ContractsVerifyComponent,
    CompilerOutputComponent
  ],
  imports: [
    CommonModule,
    ContractsRoutingModule,
    NgbPopoverModule,
    PaginatorModule,
    TableNoDataModule,
    TranslateModule,
    FormsModule,
    MaterialModule,
    DropdownModule,
    MatTableModule,
    NgbNavModule,
    CommonPipeModule,
    DateFnsModule,
    NgxMaskModule,
    ContractTableModule,
    ReactiveFormsModule,
    QrModule
  ],
  providers: [ContractService],
})
export class ContractsModule {}
