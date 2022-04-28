import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WidgetModule } from './widget/widget.module';
import { PagetitleComponent } from './components/pagetitle/pagetitle.component';
import { LoadingSprintComponent } from './components/loading-sprint/loading-sprint.component';

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
