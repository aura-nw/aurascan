import { inject, NgModule } from '@angular/core';
import { ResolveFn, RouterModule, Routes } from '@angular/router';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { NFTDetailComponent } from './nft-detail/nft-detail.component';
import { TokenDetailComponent } from './token-detail/token-detail.component';

const resolveFn: ResolveFn<{ type: string; address: string }> = (route) => {
  const contract = inject(ContractService);

  const address = route.params['contractAddress'];

  return contract.queryTokenByContractAddress(address);
};

const routes: Routes = [
  {
    path: ':contractAddress',
    component: TokenDetailComponent,
    resolve: [resolveFn],
  },
  {
    path: ':contractAddress/:nftId',
    component: NFTDetailComponent,
  },

  // {
  //   path: 'nft/:contractAddress',
  //   component: TokenDetailComponent,
  //   canMatch: [() => isEnabled(EFeature.Cw721)],
  // },
  // {
  //   path: 'nft/:contractAddress/:nftId',
  //   canMatch: [() => isEnabled(EFeature.Cw721)],
  //   component: NFTDetailComponent,
  // },
  // {
  //   path: 'abt/:contractAddress',
  //   component: TokenDetailComponent,
  //   canMatch: [() => isEnabled(EFeature.Cw4973)],
  // },
  // {
  //   path: 'abt/:contractAddress/:nftId',
  //   component: NFTDetailComponent,
  //   canMatch: [() => isEnabled(EFeature.Cw4973)],
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TokenRoutingModule {}
