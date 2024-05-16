import { inject, NgModule } from '@angular/core';
import { CanMatchFn, Router, RouterModule, Routes } from '@angular/router';
import { map } from 'rxjs';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { TokenComponent } from './token.component';

const canMatchFn: CanMatchFn = (route, segments) => {
  const router = inject(Router);

  const env = inject(EnvironmentService);
  const contract = inject(ContractService);
  const address = segments[0]?.path;

  const currentQueryParams = router.getCurrentNavigation()?.initialUrl?.queryParams;

  if (
    // Native token
    address == env.coinMinimalDenom ||
    // Cw20 token
    address?.startsWith(env.bech32PrefixAccAddr) ||
    // Ibc token
    address.length == LENGTH_CHARACTER.IBC
  ) {
    return contract.queryTokenByContractAddress(address).pipe(
      map((e) => {
        if (!e) {
          return true; // Default, Show No Data screen
        }

        const tr = router.createUrlTree(['/token', e.type.toLowerCase(), address.toLowerCase()], {
          queryParams: currentQueryParams ? { ...currentQueryParams } : {},
        });

        return tr;
      }),
    );
  } else if (address.startsWith('0x')) {
    // Evm Token
    return contract.queryTokenByContractAddress(address).pipe(
      map((e) => {
        if (!e) {
          return true; // Default, Show No Data screen
        }

        const tr = router.createUrlTree(['/token', 'evm', e.type.toLowerCase(), address.toLowerCase()], {
          queryParams: currentQueryParams ? { ...currentQueryParams } : {},
        });

        return tr;
      }),
    );
  }

  return true;
};

const routes: Routes = [
  {
    path: 'evm/:type/:contractAddress',

    loadChildren: () => import('./../evm-token/evm-token.module').then((m) => m.EvmTokenModule),
  },
  {
    path: ':type/:contractAddress',
    loadChildren: () => import('./../token-cosmos/token-cosmos.module').then((m) => m.TokenCosmosModule),
  },
  {
    path: ':contractAddress',
    pathMatch: 'full',
    canMatch: [canMatchFn],
    component: TokenComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TokenRoutingModule {}
