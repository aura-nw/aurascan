import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
@NgModule({
  declarations: [LoginComponent, ResetPasswordComponent],
  imports: [LoginRoutingModule, CustomPipeModule, FormsModule, CommonModule, ReactiveFormsModule, CustomPipeModule],
  providers: [],
  exports: [LoginComponent],
})
export class LoginModule {}
