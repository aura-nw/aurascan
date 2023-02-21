import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CodeIdsRoutingModule } from './code-ids-routing.module';
import { CodeListComponent } from './code-list/code-list.component';
import { CodeDetailComponent } from './code-detail/code-detail.component';
import { FormsModule } from '@angular/forms';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { ClickOutsideModule } from 'ng-click-outside';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { MaterialModule } from 'src/app/app.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ContractsListComponent } from './code-detail/contracts-list/contracts-list.component';
import { VerifyCodeIdComponent } from './code-detail/verify-code-id/verify-code-id.component';
import {ContractsModule} from "src/app/pages/contracts/contracts.module";

@NgModule({
  declarations: [CodeListComponent, CodeDetailComponent, ContractsListComponent, VerifyCodeIdComponent],
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
})
export class CodeIdsModule {}
