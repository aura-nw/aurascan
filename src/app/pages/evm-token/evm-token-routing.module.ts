import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EvmTokenDetailComponent } from './evm-token-detail/emv-token-detail.component';

const routes: Routes = [
  {
    path: '',
    component: EvmTokenDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EvmTokenRoutingModule {}
