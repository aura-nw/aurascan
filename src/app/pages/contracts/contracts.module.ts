import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../app.module';
import { ContractsInformationsComponent } from '../../pages/contracts/contracts-detail/contracts-informations/contracts-informations.component';
import { ContractReadTypeComponent } from '../../pages/contracts/contracts-detail/contracts-informations/info-tab/contract/contract-read-type/contract-read-type.component';
import { ContractWriteTypeComponent } from '../../pages/contracts/contracts-detail/contracts-informations/info-tab/contract/contract-write-type/contract-write-type.component';
import { ContractsListComponent } from '../../pages/contracts/contracts-list/contracts-list.component';
import { ContractsRoutingModule } from '../..//pages/contracts/contracts-routing.module';
import { ContractsTransactionsComponent } from '../../pages/contracts/contracts-transactions/contracts-transactions.component';
import { DropdownModule } from '../../shared/components/dropdown/dropdown.module';
import { PaginatorModule } from '../../shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { ContractService } from '../../core/services/contract.service';
import { ContractsDetailComponent } from './contracts-detail/contracts-detail.component';
import { ContractsInfoComponent } from './contracts-detail/contracts-info/contracts-info.component';
import { Cw20TokenComponent } from './contracts-detail/contracts-informations/info-tab/cw20-token/cw20-token.component';
import { TransactionsComponent } from './contracts-detail/contracts-informations/info-tab/transactions/transactions.component';
import { ContractsOverviewComponent } from './contracts-detail/contracts-overview/contracts-overview.component';

@NgModule({
  declarations: [
    ContractsInformationsComponent,
    ContractReadTypeComponent,
    ContractsListComponent,
    ContractsTransactionsComponent,
    ContractWriteTypeComponent,
    ContractsInfoComponent,
    ContractsDetailComponent,
    ContractsOverviewComponent,
    TransactionsComponent,
    Cw20TokenComponent
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
    NgbNavModule
  ],
  providers: [ContractService],
})
export class ContractsModule {}
