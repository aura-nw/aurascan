import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WidgetModule } from './widget/widget.module';
import { PagetitleComponent } from './pagetitle/pagetitle.component';

@NgModule({
  declarations: [
    PagetitleComponent
  ],
  imports: [
    CommonModule,
    WidgetModule
  ],
  exports: [PagetitleComponent]
})
export class SharedModule { }
