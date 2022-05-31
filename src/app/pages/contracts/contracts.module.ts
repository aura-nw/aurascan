import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../app.module';
import { PaginatorModule } from '../../shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { ContractsInformationsComponent } from './contracts-detail/contracts-informations/contracts-informations.component';
import { ContractReadTypeComponent } from './contracts-detail/contracts-informations/info-tab/contract/contract-read-type/contract-read-type.component';
import { ContractWriteTypeComponent } from './contracts-detail/contracts-informations/info-tab/contract/contract-write-type/contract-write-type.component';
import { ContractsListComponent } from './contracts-list/contracts-list.component';
import { ContractsRoutingModule } from './contracts-routing.module';

@NgModule({
  declarations: [
    ContractsInformationsComponent,
    ContractReadTypeComponent,
    ContractWriteTypeComponent,
    ContractsListComponent,
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
  ],
  providers: [],
})
export class ContractsModule {}
