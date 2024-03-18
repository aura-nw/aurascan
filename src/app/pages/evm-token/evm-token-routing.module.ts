import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { isEnabled } from 'src/app/app-routing.module';
import { EFeature } from 'src/app/core/models/common.model';
import { EvmTokenDetailComponent } from './evm-token-detail/emv-token-detail.component';
import { NFTDetailComponent } from './nft-detail/nft-detail.component';

const routes: Routes = [
  {
    path: ':contractAddress',
    component: EvmTokenDetailComponent,
    canMatch: [() => isEnabled(EFeature.Cw20)],
  },
  {
    path: 'token-nft/:contractAddress',
    component: EvmTokenDetailComponent,
    canMatch: [() => isEnabled(EFeature.Cw721)],
  },
  {
    path: 'token-abt/:contractAddress',
    component: EvmTokenDetailComponent,
    canMatch: [() => isEnabled(EFeature.Cw4973)],
  },
  {
    path: 'address/:contractAddress',
    component: EvmTokenDetailComponent,
    canMatch: [() => isEnabled(EFeature.Cw721)],
  },
  {
    path: 'token-nft/:contractAddress/:nftId',
    canMatch: [() => isEnabled(EFeature.Cw721)],
    component: NFTDetailComponent,
  },
  {
    path: 'token-abt/:contractAddress/:nftId',
    component: NFTDetailComponent,
    canMatch: [() => isEnabled(EFeature.Cw4973)],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TokenRoutingModule {}
