import { inject, NgModule } from '@angular/core';
import { ActivatedRoute, ResolveFn, Router, RouterModule, Routes } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { ContractService } from 'src/app/core/services/contract.service';
import { NFTDetailComponent } from './nft-detail/nft-detail.component';
import { TokenDetailComponent } from './token-detail/token-detail.component';

const resolveFn: ResolveFn<{ type: string; address: string } | null> = (route) => {
  const contract = inject(ContractService);

  const address = route.params['contractAddress'];
  const router = inject(Router);

  const queryParams = router.getCurrentNavigation()?.initialUrl?.queryParams;

  if (queryParams?.t) {
    return {
      type: queryParams.t,
      address,
    };
  }

  return null;
};

const routes: Routes = [
  {
    path: '',
    resolve: [resolveFn],
    component: TokenDetailComponent,
  },
  {
    path: ':nftId',
    resolve: [resolveFn],
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
export class TokenCosmosRoutingModule {}
