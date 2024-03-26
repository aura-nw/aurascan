import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { MaterialModule } from 'src/app/material.module';
import { EvmCodeComponent } from 'src/app/pages/evm-contracts/evm-contracts-detail/evm-contract-content/evm-contract/evm-code/evm-code.component';
import { EvmReadComponent } from 'src/app/pages/evm-contracts/evm-contracts-detail/evm-contract-content/evm-contract/evm-read/evm-read.component';
import { EvmWriteComponent } from 'src/app/pages/evm-contracts/evm-contracts-detail/evm-contract-content/evm-contract/evm-write/evm-write.component';
import { ContractTableModule } from 'src/app/shared/components/contract-table/contract-table.module';
import { CustomPaginatorModule } from 'src/app/shared/components/custom-paginator/custom-paginator.module';
import { DropdownModule } from 'src/app/shared/components/dropdown/dropdown.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { QrModule } from 'src/app/shared/components/qr/qr.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { EvmContractContentComponent } from './evm-contracts-detail/evm-contract-content/evm-contract-content.component';
import { EvmContractComponent } from './evm-contracts-detail/evm-contract-content/evm-contract/evm-contract.component';
import { EvmContractInfoComponent } from './evm-contracts-detail/evm-contract-info/evm-contract-info.component';
import { EvmContractsDetailComponent } from './evm-contracts-detail/evm-contracts-detail.component';
import { EvmOverviewComponent } from './evm-contracts-detail/evm-overview/evm-overview.component';
import { EvmContractsListComponent } from './evm-contracts-list/evm-contracts-list.component';
import { EvmContractsRoutingModule } from './evm-contracts-routing.module';
import { EvmContractsVerifyComponent } from './evm-contracts-verify/evm-contracts-verify.component';

@NgModule({
  declarations: [
    EvmContractsListComponent,
    EvmContractsDetailComponent,
    EvmOverviewComponent,
    EvmContractInfoComponent,
    EvmContractContentComponent,
    EvmCodeComponent,
    EvmReadComponent,
    EvmWriteComponent,
    EvmContractComponent,
    EvmContractsVerifyComponent,
  ],
  imports: [
    CommonModule,
    EvmContractsRoutingModule,
    PaginatorModule,
    TableNoDataModule,
    CustomPaginatorModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    DropdownModule,
    SharedModule,
    CustomPipeModule,
    NameTagModule,
    CommonDirectiveModule,
    TranslateModule,
    QrModule,
    NgxMaskPipe,
    NgxMaskDirective,
    ContractTableModule,
    NgbNavModule,
  ],
  exports: [EvmReadComponent, EvmWriteComponent],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class EvmContractsModule {}
