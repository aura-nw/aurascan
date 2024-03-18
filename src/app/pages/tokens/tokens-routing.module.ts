import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FungibleTokensComponent } from 'src/app/pages/tokens/fungible-tokens/fungible-tokens.component';
import { isEnabled } from 'src/app/app-routing.module';
import { EFeature } from 'src/app/core/models/common.model';
import { NonFungibleTokensComponent } from 'src/app/pages/tokens/non-fungible-tokens/non-fungible-tokens.component';
import { AccountBoundTokensComponent } from 'src/app/pages/tokens/account-bound-tokens/account-bound-tokens.component';

const routes: Routes = [
  {
    path: '',
    component: FungibleTokensComponent,
    canMatch: [() => isEnabled(EFeature.Cw20)],
  },
  {
    path: 'tokens',
    component: FungibleTokensComponent,
    canMatch: [() => isEnabled(EFeature.Cw20)],
  },
  {
    path: 'tokens-nft',
    component: NonFungibleTokensComponent,
    canMatch: [() => isEnabled(EFeature.Cw721)],
  },
  {
    path: 'token-abt',
    component: AccountBoundTokensComponent,
    canMatch: [() => isEnabled(EFeature.Cw4973)],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TokensRoutingModule {}
