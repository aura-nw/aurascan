import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layouts/layout.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: LayoutComponent, loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule) },
  // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: LayoutComponent, loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'validators', component: LayoutComponent, loadChildren: () => import('./pages/validators/validators.module').then(m => m.ValidatorsModule) },
  { path: 'blocks', component: LayoutComponent, loadChildren: () => import('./pages/blocks/blocks.module').then(m => m.BlocksModule) },
  { path: 'transaction', component: LayoutComponent, loadChildren: () => import('./pages/transaction/transaction.module').then(m => m.TransactionModule) },
  { path: 'chaincodes', component: LayoutComponent, loadChildren: () => import('./pages/chaincodes/chaincodes.module').then(m => m.ChaincodesModule) },
  { path: 'chanels', component: LayoutComponent, loadChildren: () => import('./pages/chanels/chanels.module').then(m => m.ChanelsModule) },
  { path: 'user-management', component: LayoutComponent, loadChildren: () => import('./pages/user-management/user-management.module').then(m => m.UserManagementModule) },
  { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { path: 'pages', loadChildren: () => import('./extrapages/extrapages.module').then(m => m.ExtrapagesModule)},
  { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top', relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
