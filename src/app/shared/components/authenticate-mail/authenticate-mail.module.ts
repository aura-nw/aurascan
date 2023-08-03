import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ClickOutsideModule } from 'ng-click-outside';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { AuthenticateMailComponent } from './authenticate-mail.component';

@NgModule({
  declarations: [AuthenticateMailComponent],
  imports: [
    CommonModule,
    MatMenuModule,
    RouterModule,
    ClickOutsideModule,
    TranslateModule,
    MatDialogModule,
    CommonPipeModule,
  ],
  exports: [AuthenticateMailComponent],
})
export class AuthenticateMailModule {}
