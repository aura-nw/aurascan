import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EvmTransactionComponent} from "src/app/pages/evm-transaction/evm-transaction.component";
import {EvmTransactionDetailComponent} from "src/app/pages/evm-transaction/evm-transaction-detail/evm-transaction-detail.component";

const routes: Routes = [
  {
    path: '',
    component: EvmTransactionComponent,
  },
  {
    path: ':id',
    component: EvmTransactionDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EvmTransactionRoutingModule {
}
