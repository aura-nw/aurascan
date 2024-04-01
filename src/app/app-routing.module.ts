import { inject, NgModule } from '@angular/core';
import { Router, RouterModule, Routes, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { EnvironmentService } from './core/data-services/environment.service';
import { EFeature } from './core/models/common.model';
import { LayoutComponent } from './layouts/layout.component';

export const isEnabled = (
  functionNames: string,
): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> => {
  const config = inject(EnvironmentService);
  const router = inject(Router);

  const features = config.configValue['chainConfig']?.features;

  if (features.findIndex((item) => item === functionNames) >= 0 || features.length === 0) {
    return true;
  }

  return router.navigate(['']);
};

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
        redirectTo: '',
      },
      {
        path: 'validators',
        loadChildren: () => import('./pages/validators/validators.module').then((m) => m.ValidatorsModule),
      },
      {
        path: 'block',
        loadChildren: () => import('./pages/blocks/blocks.module').then((m) => m.BlocksModule),
      },
      {
        path: 'blocks',
        loadChildren: () => import('./pages/blocks/blocks.module').then((m) => m.BlocksModule),
      },
      {
        path: 'transactions',
        loadChildren: () => import('./pages/transactions/transactions.module').then((m) => m.TransactionsModule),
      },
      {
        path: 'tx',
        loadChildren: () => import('./pages/transaction/transaction.module').then((m) => m.TransactionModule),
      },
      {
        path: 'evm-transactions',
        loadChildren: () =>
          import('./pages/evm-transactions/evm-transactions.module').then((m) => m.EvmTransactionsModule),
      },
      {
        path: 'votings',
        loadChildren: () => import('./pages/proposal/proposal.module').then((m) => m.ProposalModule),
      },
      {
        path: 'token',
        loadChildren: () => import('./pages/token/token.module').then((m) => m.TokenModule),
      },
      {
        path: 'tokens',
        loadChildren: () => import('./pages/tokens/tokens.module').then((m) => m.TokensModule),
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
        path: 'evm-contracts',
        loadChildren: () => import('./pages/evm-contracts/evm-contracts.module').then((m) => m.EvmContractsModule),
      },
      {
        path: 'code-ids',
        loadChildren: () => import('./pages/code-ids/code-ids.module').then((m) => m.CodeIdsModule),
      },
      {
        path: 'fee-grant',
        loadChildren: () => import('./pages/fee-grant/fee-grant.module').then((m) => m.FeeGrantModule),
        canMatch: [() => isEnabled(EFeature.FeeGrant)],
      },
      {
        path: 'accountbound',
        loadChildren: () =>
          import('./pages/soulbound-token/soulbound-token.module').then((m) => m.SoulboundTokenModule),
        canMatch: [() => isEnabled(EFeature.Cw4973)],
      },
      {
        path: 'community-pool',
        loadChildren: () => import('./pages/community-pool/community-pool.module').then((m) => m.CommunityPoolModule),
        canMatch: [() => isEnabled(EFeature.CommunityPool)],
      },
      {
        path: 'login',
        loadChildren: () => import('./pages/login/login.module').then((m) => m.LoginModule),
        canMatch: [() => isEnabled(EFeature.Profile)],
      },
      {
        path: 'user',
        redirectTo: 'login',
      },
      {
        path: 'profile',
        loadChildren: () => import('./pages/profile/profile.module').then((m) => m.ProfileModule),
        canMatch: [() => isEnabled(EFeature.Profile)],
      },
      {
        path: 'export-csv',
        loadChildren: () => import('./pages/export-csv/export-csv.module').then((m) => m.ExportCsvModule),
        canMatch: [() => isEnabled(EFeature.ExportCsv)],
      },
      {
        path: 'address',
        loadChildren: () => import('./pages/account/account.module').then((m) => m.AccountModule),
      },
      {
        path: 'terms',
        loadChildren: () => import('./pages/terms-of-service/terms-of-service.module').then((m) => m.TermsModule),
      },
      {
        path: 'privacyPolicy',
        loadChildren: () => import('./pages/privacy-policy/privacy-policy.module').then((m) => m.PrivacyModule),
      },
      {
        path: 'ibc-relayer',
        loadChildren: () => import('./pages/ibc/ibc.module').then((m) => m.IBCModule),
        canMatch: [() => isEnabled(EFeature.IbcRelayer)],
      },
    ],
  },
  {
    path: 'raw-data',
    loadChildren: () => import('./pages/schema-viewer/schema-viewer.module').then((m) => m.SchemaViewerModule),
    pathMatch: 'full',
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
