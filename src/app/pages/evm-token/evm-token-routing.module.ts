import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EvmTokenDetailComponent } from './evm-token-detail/evm-token-detail.component';
import { EvmNFTDetailComponent } from './evm-nft-detail/evm-nft-detail.component';

const routes: Routes = [
  {
    path: '',
    component: EvmTokenDetailComponent,
  },
  {
    path: ':nftId',
    component: EvmNFTDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EvmTokenRoutingModule {}
