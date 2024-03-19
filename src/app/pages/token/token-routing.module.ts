import { inject, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterModule, Routes, UrlSegment } from '@angular/router';
import { isEnabled } from 'src/app/app-routing.module';
import { EFeature } from 'src/app/core/models/common.model';
import { NFTDetailComponent } from './cosmos-token/nft-detail/nft-detail.component';
import { TokenDetailComponent } from './cosmos-token/token-detail/token-detail.component';
import { EWalletType } from 'src/app/core/constants/wallet.constant';
import { EvmTokenDetailComponent } from 'src/app/pages/token/evm-token/evm-token-detail/emv-token-detail.component';

const isEvm = (childRoute: ActivatedRouteSnapshot, state: UrlSegment[]) => {
  const router = inject(Router);
  if (state[0].path.startsWith(EWalletType.EVM) || state[1].path.startsWith(EWalletType.EVM)) {
    // evm
    let url: any = window.location.pathname.split('/');
    const index = url.length - 1;
    const newUrl = [...url.slice(0, index), 'evm', ...url.slice(index)].join('/');
    router.navigate([newUrl]).then();
    return false;
  }
  return true;
};

const routes: Routes = [
  // cosmos (aura)
  {
    path: ':contractAddress',
    component: TokenDetailComponent,
    canMatch: [isEvm],
  },
  {
    path: 'token-nft/:contractAddress',
    component: TokenDetailComponent,
    canMatch: [() => isEnabled(EFeature.Cw721), isEvm],
  },
  {
    path: 'token-nft/:contractAddress/:nftId',
    canMatch: [() => isEnabled(EFeature.Cw721), isEvm],
    component: NFTDetailComponent,
  },
  {
    path: 'token-abt/:contractAddress',
    component: TokenDetailComponent,
    canMatch: [() => isEnabled(EFeature.Cw4973)],
  },
  {
    path: 'token-abt/:contractAddress/:nftId',
    component: NFTDetailComponent,
    canMatch: [() => isEnabled(EFeature.Cw4973)],
  },
  // evm
  {
    path: 'evm/:contractAddress',
    component: EvmTokenDetailComponent,
  },
  {
    path: 'evm/token-nft/:contractAddress',
    component: EvmTokenDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TokenRoutingModule {}
