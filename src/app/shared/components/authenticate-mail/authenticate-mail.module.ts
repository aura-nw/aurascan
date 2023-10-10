import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { AuthenticateMailComponent } from './authenticate-mail.component';

@NgModule({
  declarations: [AuthenticateMailComponent],
  imports: [
    CommonModule,
    MatMenuModule,
    RouterModule,
    NgClickOutsideDirective,
    TranslateModule,
    MatDialogModule,
    CommonPipeModule,
  ],
  exports: [AuthenticateMailComponent],
})
export class AuthenticateMailModule {}
