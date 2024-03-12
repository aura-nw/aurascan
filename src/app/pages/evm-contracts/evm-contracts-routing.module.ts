import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EvmContractsListComponent } from 'src/app/pages/evm-contracts/evm-contracts-list/evm-contracts-list.component';
import { EvmContractsDetailComponent } from 'src/app/pages/evm-contracts/evm-contracts-detail/evm-contracts-detail.component';
import { EvmContractsVerifyComponent } from 'src/app/pages/evm-contracts/evm-contracts-verify/evm-contracts-verify.component';

const routes: Routes = [
  {
    path: '',
    component: EvmContractsListComponent,
  },
  {
    path: ':contractAddress/verify',
    component: EvmContractsVerifyComponent,
  },
  {
    path: ':contractAddress',
    component: EvmContractsDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EvmContractsRoutingModule {}
