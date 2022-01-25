import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

import { ExtrapagesRoutingModule } from './extrapages-routing.module';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { ComingsoonComponent } from './comingsoon/comingsoon.component';
import { Page404Component } from './page404/page404.component';
import { Page500Component } from './page500/page500.component';

@NgModule({
  declarations: [
    MaintenanceComponent,
    ComingsoonComponent,
    Page404Component,
    Page500Component
  ],
  imports: [
    CommonModule,
    CarouselModule,
    ExtrapagesRoutingModule,
    NgbCarouselModule
  ]
})
export class ExtrapagesModule { }
