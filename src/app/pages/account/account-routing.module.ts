import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LayoutComponent} from "../../layouts/layout.component";

const routes: Routes = [
  // { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  // {
  //   path: 'login',
  //   component: LoginComponent
  // },
  {
    path: ':address', component: LayoutComponent, loadChildren: () => import('./account-detail/account-detail.module').then(m => m.AccountDetailModule)
  },
  // {
  //   path: 'register',
  //   component: RegisterComponent
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
