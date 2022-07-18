import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagetitleComponent } from './components/pagetitle/pagetitle.component';
import { LoadingSprintComponent } from './components/loading-sprint/loading-sprint.component';
import { CardMobSimpleComponent } from './components/cards/card-mob-simple/card-mob-simple.component';

@NgModule({
  declarations: [
    PagetitleComponent,
    LoadingSprintComponent,
    CardMobSimpleComponent
  ],
  imports: [
    CommonModule
  ],
    exports: [PagetitleComponent, LoadingSprintComponent, CardMobSimpleComponent]
})
export class SharedModule { }
