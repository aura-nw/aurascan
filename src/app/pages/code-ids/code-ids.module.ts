import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ClickOutsideModule } from 'ng-click-outside';
import { MaterialModule } from 'src/app/app.module';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { ContractService } from 'src/app/core/services/contract.service';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ContractsModule } from '../contracts/contracts.module';
import { CodeIdContractsTabComponent } from './code-id-detail/code-id-contracts-tab/code-id-contracts-tab.component';
import { CodeIdDetailComponent } from './code-id-detail/code-id-detail.component';
import { VerifyCodeIdComponent } from './code-id-detail/verify-code-id/verify-code-id.component';
import { CodeIdListComponent } from './code-id-list/code-id-list.component';
import { CodeIdsRoutingModule } from './code-ids-routing.module';

@NgModule({
  declarations: [CodeIdListComponent, CodeIdDetailComponent, VerifyCodeIdComponent, CodeIdContractsTabComponent],
  imports: [
    CommonModule,
    CodeIdsRoutingModule,
    FormsModule,
    CommonPipeModule,
    ClickOutsideModule,
    TableNoDataModule,
    PaginatorModule,
    MaterialModule,
    TranslateModule,
    SharedModule,
    NgbNavModule,
    ContractsModule,
  ],
  providers: [ContractService],
})
export class CodeIdsModule {}
