import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { isEnabled } from 'src/app/app-routing.module';
import { EFeature } from 'src/app/core/models/common.model';
import { EvmNFTDetailComponent } from './evm-nft-detail/evm-nft-detail.component';
import { EvmTokenDetailComponent } from './evm-token-detail/emv-token-detail.component';

const routes: Routes = [
  {
    path: ':contractAddress',
    component: EvmTokenDetailComponent,
  },
  {
    path: 'nft/:contractAddress',
    component: EvmTokenDetailComponent,
    canMatch: [() => isEnabled(EFeature.Cw721)],
  },
  {
    path: 'nft/:contractAddress/:nftId',
    canMatch: [() => isEnabled(EFeature.Cw721)],
    component: EvmNFTDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EvmTokenRoutingModule {}
