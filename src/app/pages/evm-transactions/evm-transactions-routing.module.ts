import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EvmTransactionsComponent } from 'src/app/pages/evm-transactions/evm-transactions.component';

const routes: Routes = [
  {
    path: '',
    component: EvmTransactionsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EvmTransactionRoutingModule {}
