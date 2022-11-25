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
  {
    path: 'votings',
    component: LayoutComponent,
    loadChildren: () => import('./pages/proposal/proposal.module').then((m) => m.ProposalModule),
  },
  {
    path: 'tokens',
    component: LayoutComponent,
    loadChildren: () => import('./pages/token/token.module').then((m) => m.TokenModule),
  },
  {
    path: 'contracts',
    component: LayoutComponent,
    loadChildren: () => import('./pages/contracts/contracts.module').then((m) => m.ContractsModule),
  },
  {
    path: 'project/:id',
    component: LayoutComponent,
    loadChildren: () => import('./pages/project/project.module').then((m) => m.ProjectModule),
  },
  {
    path: 'raw-data',
    loadChildren: () => import('./pages/blank/blank.module').then((m) => m.BlankModule),
    pathMatch: 'full',
  },
  // {
  //   path: 'fee-grant',
  //   component: LayoutComponent,
  //   loadChildren: () => import('./pages/fee-grant/fee-grant.module').then((m) => m.FeeGrantModule),
  // },
  // { path: 'pages', loadChildren: () => import('./extrapages/extrapages.module').then(m => m.ExtrapagesModule)},
  { path: 'account', loadChildren: () => import('./pages/account/account.module').then((m) => m.AccountModule) },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
