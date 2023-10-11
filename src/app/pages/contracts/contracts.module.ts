import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { MaterialModule } from 'src/app/material.module';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { APaginatorModule } from 'src/app/shared/components/a-paginator/a-paginator.module';
import { ContractTableModule } from 'src/app/shared/components/contract-table/contract-table.module';
import { DropdownModule } from 'src/app/shared/components/dropdown/dropdown.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { PopupAddZeroModule } from 'src/app/shared/components/popup-add-zero/popup-add-zero.module';
import { QrModule } from 'src/app/shared/components/qr/qr.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { TooltipCustomizeModule } from 'src/app/shared/components/tooltip-customize/tooltip-customize.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ContractService } from '../../core/services/contract.service';
import { ContractInfoCardComponent } from './contracts-detail/contract-info-card/contract-info-card.component';
import { ContractContentComponent } from './contracts-detail/contracts-contents/contract-content.component';
import { CodeContractComponent } from './contracts-detail/contracts-contents/contract/contract-code/code-contract.component';
import { ContractComponent } from './contracts-detail/contracts-contents/contract/contract.component';
import { ReadContractModule } from './contracts-detail/contracts-contents/contract/read-contract/read-contract.module';
import { WriteContractModule } from './contracts-detail/contracts-contents/contract/write-contact/write-contract.module';
import { ContractsDetailComponent } from './contracts-detail/contracts-detail.component';
import { ContractsOverviewCardComponent } from './contracts-detail/contracts-overview-card/contracts-overview-card.component';
import { ContractsListComponent } from './contracts-list/contracts-list.component';
import { ContractsRoutingModule } from './contracts-routing.module';
import { ContractsTransactionsComponent } from './contracts-transactions/contracts-transactions.component';
import { ContractVerifyStepsComponent } from './contracts-verify/contract-verify-steps/contract-verify-steps.component';
import { ContractsVerifyComponent } from './contracts-verify/contracts-verify.component';

@NgModule({
  declarations: [
    ContractContentComponent,
    ContractsListComponent,
    ContractsTransactionsComponent,
    ContractInfoCardComponent,
    ContractsDetailComponent,
    ContractsOverviewCardComponent,
    ContractComponent,
    CodeContractComponent,
    ContractsVerifyComponent,
    ContractVerifyStepsComponent,
  ],
  imports: [
    CommonModule,
    ContractsRoutingModule,
    PaginatorModule,
    TableNoDataModule,
    TranslateModule,
    FormsModule,
    MaterialModule,
    DropdownModule,
    MatTableModule,
    NgbNavModule,
    CommonPipeModule,
    NgxMaskPipe,
    NgxMaskDirective,
    ContractTableModule,
    ReactiveFormsModule,
    QrModule,
    SharedModule,
    NgClickOutsideDirective,
    WriteContractModule,
    ReadContractModule,
    PopupAddZeroModule,
    APaginatorModule,
    NameTagModule,
    TooltipCustomizeModule,
    ClipboardModule,
    CommonDirectiveModule,
  ],
  providers: [ContractService],
  exports: [ContractVerifyStepsComponent],
})
export class ContractsModule {}
