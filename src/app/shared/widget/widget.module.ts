import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { RecentActivityComponent } from './recent-activity/recent-activity.component';

@NgModule({
  declarations: [
    RecentActivityComponent
  ],
  imports: [
    CommonModule,
    NgbDropdownModule
  ],
  exports: [RecentActivityComponent]
})
export class WidgetModule { }
