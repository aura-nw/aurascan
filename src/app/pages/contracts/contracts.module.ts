import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractsRoutingModule } from './contracts-routing.module';
import { ContractsInformationsComponent } from './contracts-detail/contracts-informations/contracts-informations.component';
import { ContractReadTypeComponent } from './contracts-detail/contracts-informations/info-tab/contract/contract-read-type/contract-read-type.component';
import { ContractWriteTypeComponent } from './contracts-detail/contracts-informations/info-tab/contract/contract-write-type/contract-write-type.component';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    ContractsInformationsComponent,
    ContractReadTypeComponent,
    ContractWriteTypeComponent,
  ],
  imports: [
    CommonModule,
    ContractsRoutingModule,
    NgbPopoverModule
  ],
  providers: []
})
export class ContractsModule { }
