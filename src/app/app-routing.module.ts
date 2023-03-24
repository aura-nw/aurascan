import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layouts/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'validators',
        loadChildren: () => import('./pages/validators/validators.module').then((m) => m.ValidatorsModule),
      },
      {
        path: 'blocks',
        loadChildren: () => import('./pages/blocks/blocks.module').then((m) => m.BlocksModule),
      },
      {
        path: 'transaction',
        loadChildren: () => import('./pages/transaction/transaction.module').then((m) => m.TransactionModule),
      },
      {
        path: 'votings',
        loadChildren: () => import('./pages/proposal/proposal.module').then((m) => m.ProposalModule),
      },
      {
        path: 'tokens',
        loadChildren: () => import('./pages/token/token.module').then((m) => m.TokenModule),
      },
      {
        path: 'statistics',
        loadChildren: () => import('./pages/statistics/statistics.module').then((m) => m.StatisticsModule),
      },
      {
        path: 'contracts',
        loadChildren: () => import('./pages/contracts/contracts.module').then((m) => m.ContractsModule),
      },
      {
        path: 'code-ids',
        loadChildren: () => import('./pages/code-ids/code-ids.module').then((m) => m.CodeIdsModule),
      },
      {
        path: 'fee-grant',
        loadChildren: () => import('./pages/fee-grant/fee-grant.module').then((m) => m.FeeGrantModule),
      },
      {
        path: 'accountbound',
        loadChildren: () =>
          import('./pages/soulbound-token/soulbound-token.module').then((m) => m.SoulboundTokenModule),
      },
    ],
  },
  { path: 'account', loadChildren: () => import('./pages/account/account.module').then((m) => m.AccountModule) },
  {
    path: 'raw-data',
    loadChildren: () => import('./pages/schema-viewer/schema-viewer.module').then((m) => m.SchemaViewerModule),
    pathMatch: 'full',
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
