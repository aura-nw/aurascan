import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NFTDetailComponent } from './nft-detail/nft-detail.component';
import { TokenDetailComponent } from './token-detail/token-detail.component';
import { TokenHoldingComponent } from './token-holding/token-holding.component';
import { TokenCw20Component } from './token-list/token-cw20/token-cw20.component';
import { TokenCw721Component } from './token-list/token-cw721/token-cw721.component';

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
    path: 'token/:contractAddress',
    component: TokenDetailComponent,
  },
  {
    path: 'token-nft/:contractAddress',
    component: TokenDetailComponent,
  },
  {
    path: 'address/:contractAddress',
    component: TokenDetailComponent,
  },
  {
    path: 'token-holding/:contractAddress',
    component: TokenHoldingComponent,
  },
  {
    path: 'token-nft/:contractAddress/:nftId',
    component: NFTDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TokenRoutingModule {}
