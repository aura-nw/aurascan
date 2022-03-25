import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountDetailRoutingModule } from './account-detail-routing.module';
import { AccountDetailComponent } from './account-detail.component';
import { SharedModule } from "../../shared/shared.module";
import { AccountInfoComponent } from './account-info/account-info.component';
import { TokenTableComponent } from './token-table/token-table.component';
import { StackingTabComponent } from './stacking-tab/stacking-tab.component';
import { StackingAccountComponent } from './stacking-account/stacking-account.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { MaterialModule } from '../../../app/app.module';
import { CommonPipeModule } from '../../../app/core/pipes/common-pipe.module';
import { FormsModule } from '@angular/forms';
import { SimplebarAngularModule } from 'simplebar-angular';
import { TranslateModule } from '@ngx-translate/core';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FeatherModule } from 'angular-feather';
import { TableModule } from './table/table.module';
import { AccountService } from '../../../app/core/services/account.service';

@NgModule({
  declarations: [
    AccountDetailComponent,
    AccountInfoComponent,
    TokenTableComponent,
    StackingTabComponent,
    StackingAccountComponent,
    TransactionsComponent,
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
    TableModule
  ],
  providers: [TransactionService, AccountService]
})
export class AccountDetailModule { }
