import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NFTDetailComponent } from './nft-detail/nft-detail.component';
import { TokenDetailComponent } from './token-detail/token-detail.component';

const routes: Routes = [
  {
    path: '',
    component: TokenDetailComponent,
  },
  {
    path: ':nftId',
    component: NFTDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TokenCosmosRoutingModule {}
