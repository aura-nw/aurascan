import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvmContractsRoutingModule } from './evm-contracts-routing.module';
import { EvmContractsListComponent } from './evm-contracts-list/evm-contracts-list.component';
import { EvmContractsDetailComponent } from './evm-contracts-detail/evm-contracts-detail.component';
import { CustomPaginatorModule } from 'src/app/shared/components/custom-paginator/custom-paginator.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { TranslateModule } from '@ngx-translate/core';
import { EvmOverviewComponent } from './evm-contracts-detail/evm-overview/evm-overview.component';
import { EvmContractInfoComponent } from './evm-contracts-detail/evm-contract-info/evm-contract-info.component';
import { QrModule } from 'src/app/shared/components/qr/qr.module';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { EvmContractContentComponent } from './evm-contracts-detail/evm-contract-content/evm-contract-content.component';
import { ContractTableModule } from 'src/app/shared/components/contract-table/contract-table.module';
import { EvmContractComponent } from './evm-contracts-detail/evm-contract-content/evm-contract/evm-contract.component';
import { EvmCodeComponent } from 'src/app/pages/evm-contracts/evm-contracts-detail/evm-contract-content/evm-contract/evm-code/evm-code.component';
import { EvmReadComponent } from 'src/app/pages/evm-contracts/evm-contracts-detail/evm-contract-content/evm-contract/evm-read/evm-read.component';
import { EvmWriteComponent } from 'src/app/pages/evm-contracts/evm-contracts-detail/evm-contract-content/evm-contract/evm-write/evm-write.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { EvmContractsVerifyComponent } from './evm-contracts-verify/evm-contracts-verify.component';
import { EvmContractVerifyStepsComponent } from './evm-contracts-verify/evm-contract-verify-steps/evm-contract-verify-steps.component';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { ContractVerifyStepsComponent } from 'src/app/pages/contracts/contracts-verify/contract-verify-steps/contract-verify-steps.component';
import { DropdownModule } from 'src/app/shared/components/dropdown/dropdown.module';

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
    EvmContractVerifyStepsComponent,
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
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
  exports: [EvmContractVerifyStepsComponent],
})
export class EvmContractsModule {}
