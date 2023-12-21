import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { MaterialModule } from 'src/app/material.module';
import { AuthenticateMailComponent } from './authenticate-mail.component';

@NgModule({
  declarations: [AuthenticateMailComponent],
  imports: [CommonModule, MaterialModule, RouterModule, NgClickOutsideDirective, TranslateModule, CustomPipeModule],
  exports: [AuthenticateMailComponent],
})
export class AuthenticateMailModule {}
