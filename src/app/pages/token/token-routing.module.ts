import { inject, NgModule } from '@angular/core';
import { CanMatchFn, RouterModule, Routes } from '@angular/router';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

const canMatchCosmosFn: CanMatchFn = (route, segments) => {
  const env = inject(EnvironmentService);

  console.log(env.bech32PrefixAccAddr, env.coinMinimalDenom);

  const path = segments[0]?.path;

  if (path == env.coinMinimalDenom || path?.startsWith(env.bech32PrefixAccAddr)) {
    return true;
  }

  return false;
};

const canMatchEvmFn: CanMatchFn = (route, segments) => {
  const path = segments[0]?.path;

  if (path.startsWith('0x')) {
    return true;
  }

  return false;
};

const routes: Routes = [
  {
    path: ':address',
    canMatch: [canMatchCosmosFn],
    loadChildren: () => import('./../token-cosmos/token-cosmos.module').then((m) => m.TokenCosmosModule),
  },
  {
    path: ':address',
    canMatch: [canMatchEvmFn],
    loadChildren: () => import('./../evm-token/evm-token.module').then((m) => m.EvmTokenModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TokenRoutingModule {}
