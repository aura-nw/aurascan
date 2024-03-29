import { inject, NgModule } from '@angular/core';
import { CanMatchFn, Router, RouterModule, Routes } from '@angular/router';
import { map } from 'rxjs';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';

const canMatchCosmosFn: CanMatchFn = (route, segments) => {
  const router = inject(Router);
  const queryParams = router.getCurrentNavigation()?.initialUrl?.queryParams;

  console.log({ queryParams });

  if (queryParams?.t) {
    return true;
  }

  const env = inject(EnvironmentService);
  const contract = inject(ContractService);
  const path = segments[0]?.path;

  if (
    // Native token
    path == env.coinMinimalDenom ||
    // Cw20 token
    path?.startsWith(env.bech32PrefixAccAddr) ||
    // Ibc token
    path.length == LENGTH_CHARACTER.IBC
  ) {
    return contract.queryTokenByContractAddress(path).pipe(
      map((e) => {
        const tr = router.createUrlTree(['/token', path], {
          queryParams: { t: e.type },
          queryParamsHandling: 'merge',
        });

        return tr;
      }),
    );
  }

  return false;
};

const canMatchEvmFn: CanMatchFn = (route, segments) => {
  return true;

  // if (path.startsWith('0x')) {
  //   return true;
  // }

  // return false;
};

const routes: Routes = [
  {
    path: ':contractAddress',
    canMatch: [canMatchCosmosFn],
    loadChildren: () => import('./../token-cosmos/token-cosmos.module').then((m) => m.TokenCosmosModule),
  },
  // {
  //   path: 'evm/:contractAddress',
  //   loadChildren: () => import('./../evm-token/evm-token.module').then((m) => m.EvmTokenModule),
  // },
  // {
  //   path: ':contractAddress',
  //   canMatch: [canMatchCosmosFn],
  //   pathMatch: 'full',
  //   component: CXXX,
  // },
  // {
  //   path: ':contractAddress',
  //   canMatch: [canMatchEvmFn],
  //   pathMatch: 'full',
  //   redirectTo: 'evm/:contractAddress',
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TokenRoutingModule {}
