import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TokenDetailComponent } from './token-detail/token-detail.component';
import { TokenCw20Component } from './token-list/token-cw20/token-cw20.component';
import { TokenCw721Component } from './token-list/token-cw721/token-cw721.component';
import {TokenHoldingComponent} from "./token-holding/token-holding.component";

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
    component: TokenDetailComponent,
  },
  {
    path: 'address/:tokenId',
    component: TokenDetailComponent,
  },
  {
    path: 'token-holding/:tokenId',
    component: TokenHoldingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TokenRoutingModule {}
