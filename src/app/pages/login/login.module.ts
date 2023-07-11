import { NgModule } from '@angular/core';
import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [LoginComponent],
  imports: [LoginRoutingModule, CommonPipeModule, FormsModule],
  providers: [],
  exports: [LoginComponent],
})
export class LoginModule {}
