import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SmartContractDetailComponent } from './smart-contract-detail/smart-contract-detail.component';
import { TokenCw20Component } from './smart-contract-list/token-cw20/token-cw20.component';
import { TokenCw721Component } from './smart-contract-list/token-cw721/token-cw721.component';

const routes: Routes = [
  {
    path: '',
    component: TokenCw20Component,
  },
  {
    path: 'tokens',
    component: TokenCw20Component,
  },
  {
    path: 'tokens-nft',
    component: TokenCw721Component,
  },
  {
    path: 'token/:tokenId',
    component: SmartContractDetailComponent,
  },
  {
    path: 'address/:tokenId',
    component: SmartContractDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SmartContractRoutingModule {}
