import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import {
  GoogleLoginProvider,
  GoogleSigninButtonModule,
  SocialAuthServiceConfig,
  SocialLoginModule,
} from '@abacritt/angularx-social-login';

const config: SocialAuthServiceConfig = {
  autoLogin: false,
  providers: [
    {
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider('3465782004-hp7u6vlitgs109rl0emrsf1oc7bjvu08.apps.googleusercontent.com'),
    },
    // Add other providers if needed
  ],
};
@NgModule({
  declarations: [LoginComponent, ResetPasswordComponent],
  imports: [
    LoginRoutingModule,
    CustomPipeModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    CustomPipeModule,
    GoogleSigninButtonModule,
    SocialLoginModule.initialize(config),
  ],
  providers: [],
  exports: [LoginComponent],
})
export class LoginModule {}
