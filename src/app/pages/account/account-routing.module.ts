import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from '../../layouts/layout.component';

const routes: Routes = [
  {
    path: ':address',
    component: LayoutComponent,
    loadChildren: () => import('./account-detail/account-detail.module').then((m) => m.AccountDetailModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
