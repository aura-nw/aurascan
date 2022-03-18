import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountDetailRoutingModule } from './account-detail-routing.module';
import { AccountDetailComponent } from './account-detail.component';
import {SharedModule} from "../../shared/shared.module";
import { AccountInfoComponent } from './account-info/account-info.component';
import { TokenTableComponent } from './token-table/token-table.component';
import { StackingTabComponent } from './stacking-tab/stacking-tab.component';
import { StackingAccountComponent } from './stacking-account/stacking-account.component';
import { TransactionsComponent } from './transactions/transactions.component';


@NgModule({
  declarations: [
    AccountDetailComponent,
    AccountInfoComponent,
    TokenTableComponent,
    StackingTabComponent,
    StackingAccountComponent,
    TransactionsComponent
  ],
    imports: [
        CommonModule,
        AccountDetailRoutingModule,
        SharedModule
    ]
})
export class AccountDetailModule { }
