import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { UserService } from 'src/app/core/services/user.service';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
@NgModule({
  declarations: [LoginComponent, ResetPasswordComponent],
  imports: [
    LoginRoutingModule,
    CustomPipeModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    CustomPipeModule,
    TranslateModule,
  ],
  providers: [UserService],
  exports: [LoginComponent],
})
export class LoginModule {}
