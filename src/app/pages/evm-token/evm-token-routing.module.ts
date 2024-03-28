import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EvmTokenDetailComponent } from './evm-token-detail/emv-token-detail.component';

const routes: Routes = [
  {
    path: '',
    component: EvmTokenDetailComponent,
  },
  // {
  //   path: ':nftId',
  //   component: EvmTokenDetailComponent,
  //   canMatch: [() => isEnabled(EFeature.Cw721)],
  // },
  // {
  //   path: 'nft/:contractAddress/:nftId',
  //   canMatch: [() => isEnabled(EFeature.Cw721)],
  //   component: EvmNFTDetailComponent,
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EvmTokenRoutingModule {}
