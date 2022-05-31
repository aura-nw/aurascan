import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { TokenService } from 'src/app/core/services/token.service';
import { MaterialModule } from '../../app.module';
import { PaginatorModule } from '../../shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { ContractsDetailComponent } from './contracts-detail/contracts-detail.component';
import { ContractsInfoComponent } from './contracts-detail/contracts-info/contracts-info.component';
import { ContractsInformationsComponent } from './contracts-detail/contracts-informations/contracts-informations.component';
import { ContractReadTypeComponent } from './contracts-detail/contracts-informations/info-tab/contract/contract-read-type/contract-read-type.component';
import { ContractWriteTypeComponent } from './contracts-detail/contracts-informations/info-tab/contract/contract-write-type/contract-write-type.component';
import { Cw20TokenComponent } from './contracts-detail/contracts-informations/info-tab/cw20-token/cw20-token.component';
import { TransactionsComponent } from './contracts-detail/contracts-informations/info-tab/transactions/transactions.component';
import { ContractsOverviewComponent } from './contracts-detail/contracts-overview/contracts-overview.component';
import { ContractsListComponent } from './contracts-list/contracts-list.component';
import { ContractsRoutingModule } from './contracts-routing.module';
@NgModule({
  declarations: [
    ContractsInformationsComponent,
    ContractReadTypeComponent,
    ContractWriteTypeComponent,
    ContractsListComponent,
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
    MatTableModule,
    FormsModule,
    MaterialModule,
    NgbNavModule
  ],
  providers: [TokenService],
})
export class ContractsModule {}
