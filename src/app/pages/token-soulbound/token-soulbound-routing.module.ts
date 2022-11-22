import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  TokenSoulboundContractListComponent
} from "src/app/pages/token-soulbound/token-soulbound-contract-list/token-soulbound-contract-list.component";

const routes: Routes = [{
  path: '',
  component: TokenSoulboundContractListComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TokenSoulboundRoutingModule { }
