import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountDetailRoutingModule } from './account-detail-routing.module';
import { AccountDetailComponent } from './account-detail.component';
import { SharedModule } from "../../shared/shared.module";
import { AccountInfoComponent } from './account-info/account-info.component';
import { StackingTabComponent } from './stacking-tab/stacking-tab.component';
import { StackingAccountComponent } from './stacking-account/stacking-account.component';
import { MaterialModule } from '../../../app/app.module';
import { CommonPipeModule } from '../../../app/core/pipes/common-pipe.module';
import { FormsModule } from '@angular/forms';
import { SimplebarAngularModule } from 'simplebar-angular';
import { TranslateModule } from '@ngx-translate/core';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FeatherModule } from 'angular-feather';
import { AccountDetailTableModule } from './account-detail-table/account-detail-table.module';
import { AccountService } from '../../../app/core/services/account.service';
import { TableNoDataModule } from '../../../app/shared/table-no-data/table-no-data.module';
import { PaginatorModule } from '../../shared/components/paginator/paginator.module';

@NgModule({
  declarations: [
    AccountDetailComponent,
    AccountInfoComponent,
    StackingTabComponent,
    StackingAccountComponent,
    // TableComponent
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
  ],
  providers: [TransactionService, AccountService]
})
export class AccountDetailModule { }
