import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TokenCw20Component} from "src/app/pages/tokens/token-cw20/token-cw20.component";
import {isEnabled} from "src/app/app-routing.module";
import {EFeature} from "src/app/core/models/common.model";
import {TokenCw721Component} from "src/app/pages/tokens/token-cw721/token-cw721.component";
import {TokenCw4973Component} from "src/app/pages/tokens/token-cw4973/token-cw4973.component";

const routes: Routes = [
  {
    path: '',
    component: TokenCw20Component,
    canMatch: [() => isEnabled(EFeature.Cw20)],
  },
  {
    path: 'tokens',
    component: TokenCw20Component,
    canMatch: [() => isEnabled(EFeature.Cw20)],
  },
  {
    path: 'tokens-nft',
    component: TokenCw721Component,
    canMatch: [() => isEnabled(EFeature.Cw721)],
  },
  {
    path: 'token-abt',
    component: TokenCw4973Component,
    canMatch: [() => isEnabled(EFeature.Cw4973)],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TokensRoutingModule {
}
