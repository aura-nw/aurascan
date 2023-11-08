import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { NotificationComponent } from './notification.component';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { SharedModule } from '../../shared.module';

@NgModule({
  declarations: [NotificationComponent],
  imports: [CommonModule, MaterialModule, RouterModule, CommonPipeModule, SharedModule],
  exports: [NotificationComponent],
})
export class NotificationModule {}
