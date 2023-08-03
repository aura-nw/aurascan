import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: ':mode',
    component: LoginComponent,
  },
  {
    path: 'welcome',
    component: LoginComponent,
  },
  {
    path: 'already-active',
    component: LoginComponent,
  },
  {
    path: 'reset-password/email/:email/code/:code',
    component: ResetPasswordComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginRoutingModule {}
