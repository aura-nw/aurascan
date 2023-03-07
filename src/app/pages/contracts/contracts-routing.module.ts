import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractsDetailComponent } from './contracts-detail/contracts-detail.component';
import { ContractsListComponent } from './contracts-list/contracts-list.component';
import { ContractsRegisterComponent } from './contracts-register/contracts-register.component';
import { ContractsTransactionsComponent } from './contracts-transactions/contracts-transactions.component';

const routes: Routes = [
  {
    path: '',
    component: ContractsListComponent,
  },
  {
    path: 'register',
    component: ContractsRegisterComponent,
  },
  {
    path: 'transactions/:addressId',
    component: ContractsTransactionsComponent,
  },
  {
    path: ':contractAddress',
    component: ContractsDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContractsRoutingModule {}
