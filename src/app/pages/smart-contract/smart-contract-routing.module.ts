import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SmartContractComponent} from "./smart-contract.component";
import {SmartContractDetailComponent} from "./smart-contract-detail/smart-contract-detail.component";

const routes: Routes = [
  {
    path: '',
    component: SmartContractComponent
  },
  {
    path: 'token/:tokenId',
    component: SmartContractDetailComponent
  },
  {
    path: 'address/:tokenId',
    component: SmartContractDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SmartContractRoutingModule { }
