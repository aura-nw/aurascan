import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WidgetModule } from './widget/widget.module';
import { PagetitleComponent } from './pagetitle/pagetitle.component';
import { LoadingSprintComponent } from './loading/loading-sprint/loading-sprint.component';

@NgModule({
  declarations: [
    PagetitleComponent,
    LoadingSprintComponent
  ],
  imports: [
    CommonModule,
    WidgetModule
  ],
  exports: [PagetitleComponent, LoadingSprintComponent]
})
export class SharedModule { }
