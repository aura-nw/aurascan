import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SmartContractDetailComponent} from "./smart-contract-detail/smart-contract-detail.component";
import {TokenErc20Component} from "./smart-contract-list/token-erc20/token-erc20.component";
import {TokenErc721Component} from "./smart-contract-list/token-erc721/token-erc721.component";

const routes: Routes = [
  {
    path: '',
    component: TokenErc20Component
  },
  {
    path: 'tokens',
    component: TokenErc20Component
  },
  {
    path: 'tokens-nft',
    component: TokenErc721Component
  },
  {
    path: 'token/:tokenId',
    component: SmartContractDetailComponent
  },
  {
    path: 'address/:tokenId',
    component: SmartContractDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SmartContractRoutingModule { }
