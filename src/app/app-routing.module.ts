import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layouts/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    loadChildren: () => import('./pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: LayoutComponent,
    loadChildren: () => import('./pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'validators',
    component: LayoutComponent,
    loadChildren: () => import('./pages/validators/validators.module').then((m) => m.ValidatorsModule),
  },
  {
    path: 'blocks',
    component: LayoutComponent,
    loadChildren: () => import('./pages/blocks/blocks.module').then((m) => m.BlocksModule),
  },
  {
    path: 'transaction',
    component: LayoutComponent,
    loadChildren: () => import('./pages/transaction/transaction.module').then((m) => m.TransactionModule),
  },
  // { path: 'chaincodes', component: LayoutComponent, loadChildren: () => import('./pages/chaincodes/chaincodes.module').then(m => m.ChaincodesModule) },
  // { path: 'chanels', component: LayoutComponent, loadChildren: () => import('./pages/chanels/chanels.module').then(m => m.ChanelsModule) },
  {
    path: 'votings',
    component: LayoutComponent,
    loadChildren: () => import('./pages/proposal/proposal.module').then((m) => m.ProposalModule),
  },
  {
    path: 'token',
    component: LayoutComponent,
    loadChildren: () => import('./pages/token/token.module').then((m) => m.TokenModule),
  },
  {
    path: 'contracts',
    component: LayoutComponent,
    loadChildren: () => import('./pages/contracts/contracts.module').then((m) => m.ContractsModule),
  },
  {
    path: 'raw-data',
    loadChildren: () => import('./pages/blank/blank.module').then((m) => m.BlankModule),
    pathMatch: 'full',
  },
  // { path: 'pages', loadChildren: () => import('./extrapages/extrapages.module').then(m => m.ExtrapagesModule)},
  { path: 'account', loadChildren: () => import('./pages/account/account.module').then((m) => m.AccountModule) },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
