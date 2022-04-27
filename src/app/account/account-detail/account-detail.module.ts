import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SimplebarAngularModule } from 'simplebar-angular';
import { MaterialModule } from '../../../app/app.module';
import { CommonPipeModule } from '../../../app/core/pipes/common-pipe.module';
import { AccountService } from '../../../app/core/services/account.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { QrModule } from '../../../app/shared/components/qr/qr.module';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { PaginatorModule } from '../../shared/components/paginator/paginator.module';
import { SharedModule } from "../../shared/shared.module";
import { AccountDetailRoutingModule } from './account-detail-routing.module';
import { AccountDetailTableModule } from './account-detail-table/account-detail-table.module';
import { AccountDetailComponent } from './account-detail.component';

@NgModule({
  declarations: [
    AccountDetailComponent,
  ],
  imports: [
    CommonModule,
    AccountDetailRoutingModule,
    SharedModule,
    CommonModule,
    MaterialModule,
    CommonPipeModule,
    FormsModule,
    SimplebarAngularModule,
    TranslateModule,
    NgApexchartsModule,
    FeatherModule,
    AccountDetailTableModule,
    TableNoDataModule,
    PaginatorModule,
    QrModule
  ],
  providers: [TransactionService, AccountService]
})
export class AccountDetailModule { }
