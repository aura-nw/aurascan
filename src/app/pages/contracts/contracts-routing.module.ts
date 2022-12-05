import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractsDetailComponent } from './contracts-detail/contracts-detail.component';
import { ContractsListComponent } from './contracts-list/contracts-list.component';
import { ContractsRegisterComponent } from './contracts-register/contracts-register.component';
import { ContractsTransactionsComponent } from './contracts-transactions/contracts-transactions.component';
import { ContractsVerifyComponent } from './contracts-verify/contracts-verify.component';
import {
  ContractsDeployMainnetComponent
} from "src/app/pages/contracts/contracts-deploy-mainnet/contracts-deploy-mainnet.component";
import {ContractsSmartListComponent} from "src/app/pages/contracts/contracts-smart-list/contracts-smart-list.component";

const routes: Routes = [
  {
    path: '',
    component: ContractsListComponent
  },
  {
    path: 'register',
    component: ContractsRegisterComponent,
  },
  {
    path: 'verify/:addressId/:code_id',
    component: ContractsVerifyComponent
  },
  {
    path: 'transactions/:addressId',
    component: ContractsTransactionsComponent
  },
  {
    path: 'contracts-deploy-mainnet',
    component: ContractsDeployMainnetComponent,
  },
  {
    path: 'smart-contract-list',
    component: ContractsSmartListComponent,
  },
  {
    path: ':contractAddress',
    component: ContractsDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractsRoutingModule { }
