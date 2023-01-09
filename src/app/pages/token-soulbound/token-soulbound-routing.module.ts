import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  TokenSoulboundContractListComponent
} from "src/app/pages/token-soulbound/token-soulbound-contract-list/token-soulbound-contract-list.component";
import {
  TokenSoulboundContractTokensComponent
} from "src/app/pages/token-soulbound/token-soulbound-contract-tokens/token-soulbound-contract-tokens.component";
import {
  TokenSoulboundAccountTokenListComponent
} from "src/app/pages/token-soulbound/token-soulbound-account-token-list/token-soulbound-account-token-list.component";

const routes: Routes = [
  {
    path: '',
    component: TokenSoulboundContractListComponent
  },
  {
    path: 'contract/:address',
    component: TokenSoulboundContractTokensComponent
  },
  {
    path: 'account/:address',
    component: TokenSoulboundAccountTokenListComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TokenSoulboundRoutingModule { }
