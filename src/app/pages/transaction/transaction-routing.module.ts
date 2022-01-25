import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransactionComponent } from './transaction.component';
import { TxsDetailComponent } from './txs-detail/txs-detail.component';

const routes: Routes = [
  {
    path: '',
    component: TransactionComponent
  },
  {
    path: ':id',
    component: TxsDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class TransactionRoutingModule { }
