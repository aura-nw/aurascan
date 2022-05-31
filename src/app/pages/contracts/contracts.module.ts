import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DateFnsModule } from 'ngx-date-fns';
import { MaterialModule } from 'src/app/app.module';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { ContractsInformationsComponent } from 'src/app/pages/contracts/contracts-detail/contracts-informations/contracts-informations.component';
import { ContractReadTypeComponent } from 'src/app/pages/contracts/contracts-detail/contracts-informations/info-tab/contract/contract-read-type/contract-read-type.component';
import { ContractWriteTypeComponent } from 'src/app/pages/contracts/contracts-detail/contracts-informations/info-tab/contract/contract-write-type/contract-write-type.component';
import { ContractsListComponent } from 'src/app/pages/contracts/contracts-list/contracts-list.component';
import { ContractsRoutingModule } from 'src/app/pages/contracts/contracts-routing.module';
import { ContractsTransactionsComponent } from 'src/app/pages/contracts/contracts-transactions/contracts-transactions.component';
import { DropdownModule } from 'src/app/shared/components/dropdown/dropdown.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { ContractService } from '../../core/services/contract.service';


@NgModule({
  declarations: [
    ContractsInformationsComponent,
    ContractReadTypeComponent,
    ContractsListComponent,
    ContractsTransactionsComponent,
    ContractWriteTypeComponent
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
    CommonPipeModule,
    DateFnsModule
  ],
  providers: [ContractService],
})
export class ContractsModule {}
