import { NgModule } from '@angular/core';
import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PopupVerifyMailComponent } from './popup-verify-mail/popup-verify-mail.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
@NgModule({
  declarations: [LoginComponent, PopupVerifyMailComponent, ResetPasswordComponent],
  imports: [
    LoginRoutingModule,
    CommonPipeModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    CommonPipeModule,
  ],
  providers: [],
  exports: [LoginComponent],
})
export class LoginModule {}
