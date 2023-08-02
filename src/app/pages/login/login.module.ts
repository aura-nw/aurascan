import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { UserService } from 'src/app/core/services/user.service';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
@NgModule({
  declarations: [LoginComponent, ResetPasswordComponent],
  imports: [
    LoginRoutingModule,
    CommonPipeModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    CommonPipeModule,
  ],
  providers: [UserService],
  exports: [LoginComponent],
})
export class LoginModule {}
