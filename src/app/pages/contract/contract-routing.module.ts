import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractDetailComponent } from './contract-detail/contract-detail.component';
import { ContractComponent } from './contract.component';


const routes: Routes = [
  {
    path: '',
    component: ContractComponent
  },
  {
    path: ':id',
    component: ContractDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ContractRoutingModule { }
