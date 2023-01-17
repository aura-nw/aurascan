import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SoulboundAccountTokenListComponent } from './soulbound-account-token-list/soulbound-account-token-list.component';
import { SoulboundContractListComponent } from './soulbound-contract-list/soulbound-contract-list.component';
import { SoulboundTokenContractComponent } from './soulbound-token-contract/soulbound-token-contract.component';

const routes: Routes = [
  {
    path: '',
    component: SoulboundContractListComponent,
  },
  // {
  //   path: 'contract/:address',
  //   component: SoulboundTokenContractComponent,
  // },
  // {
  //   path: 'account/:address',
  //   component: SoulboundAccountTokenListComponent,
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SoulboundTokenRoutingModule {}
