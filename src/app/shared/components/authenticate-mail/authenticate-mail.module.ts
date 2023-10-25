import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { MaterialModule } from 'src/app/material.module';
import { AuthenticateMailComponent } from './authenticate-mail.component';

@NgModule({
  declarations: [AuthenticateMailComponent],
  imports: [CommonModule, MaterialModule, RouterModule, NgClickOutsideDirective, TranslateModule, CommonPipeModule],
  exports: [AuthenticateMailComponent],
})
export class AuthenticateMailModule {}
