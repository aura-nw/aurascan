import { NgModule, inject } from '@angular/core';
import { Router, RouterModule, Routes, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LayoutComponent } from './layouts/layout.component';
import { EnvironmentService } from './core/data-services/environment.service';

const isEnabled = (
  functionNames: string,
): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> => {
  const config = inject(EnvironmentService);
  const router = inject(Router);

  const features = config.configValue['chainConfig']?.features;

  if (features.findIndex((item) => item === functionNames) >= 0 || !features) {
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
        canMatch: [() => isEnabled('validators')],
      },
      {
        path: 'blocks',
        loadChildren: () => import('./pages/blocks/blocks.module').then((m) => m.BlocksModule),
        canMatch: [() => isEnabled('blocks')],
      },
      {
        path: 'transaction',
        loadChildren: () => import('./pages/transaction/transaction.module').then((m) => m.TransactionModule),
        canMatch: [() => isEnabled('transaction')],
      },
      {
        path: 'votings',
        loadChildren: () => import('./pages/proposal/proposal.module').then((m) => m.ProposalModule),
        canMatch: [() => isEnabled('votings')],
      },
      {
        path: 'tokens',
        loadChildren: () => import('./pages/token/token.module').then((m) => m.TokenModule),
        canMatch: [() => isEnabled('tokens')],
      },
      {
        path: 'statistics',
        loadChildren: () => import('./pages/statistics/statistics.module').then((m) => m.StatisticsModule),
        canMatch: [() => isEnabled('statistics')],
      },
      {
        path: 'contracts',
        loadChildren: () => import('./pages/contracts/contracts.module').then((m) => m.ContractsModule),
        canMatch: [() => isEnabled('contracts')],
      },
      {
        path: 'code-ids',
        loadChildren: () => import('./pages/code-ids/code-ids.module').then((m) => m.CodeIdsModule),
        canMatch: [() => isEnabled('code-ids')],
      },
      {
        path: 'fee-grant',
        loadChildren: () => import('./pages/fee-grant/fee-grant.module').then((m) => m.FeeGrantModule),
        canMatch: [() => isEnabled('fee-grant')],
      },
      {
        path: 'accountbound',
        loadChildren: () =>
          import('./pages/soulbound-token/soulbound-token.module').then((m) => m.SoulboundTokenModule),
        canMatch: [() => isEnabled('accountbound')],
      },
      {
        path: 'community-pool',
        loadChildren: () => import('./pages/community-pool/community-pool.module').then((m) => m.CommunityPoolModule),
        canMatch: [() => isEnabled('community-pool')],
      },
      {
        path: 'login',
        loadChildren: () => import('./pages/login/login.module').then((m) => m.LoginModule),
        canMatch: [() => isEnabled('login')],
      },
      {
        path: 'user',
        redirectTo: 'login',
      },
      {
        path: 'profile',
        loadChildren: () => import('./pages/profile/profile.module').then((m) => m.ProfileModule),
        canMatch: [() => isEnabled('profile')],
      },
      {
        path: 'export-csv',
        loadChildren: () => import('./pages/export-csv/export-csv.module').then((m) => m.ExportCsvModule),
        canMatch: [() => isEnabled('export-csv')],
      },
      {
        path: 'account',
        loadChildren: () => import('./pages/account/account.module').then((m) => m.AccountModule),
        canMatch: [() => isEnabled('account')],
      },
      {
        path: 'terms',
        loadChildren: () => import('./pages/terms-of-service/terms-of-service.module').then((m) => m.TermsModule),
        canMatch: [() => isEnabled('terms')],
      },
      {
        path: 'privacyPolicy',
        loadChildren: () => import('./pages/privacy-policy/privacy-policy.module').then((m) => m.PrivacyModule),
        canMatch: [() => isEnabled('privacyPolicy')],
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
