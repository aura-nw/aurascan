import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { WidgetModule } from 'src/app/shared/widget/widget.module';
import { CountToModule } from 'angular-count-to';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SimplebarAngularModule } from 'simplebar-angular';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { LightboxModule } from 'ngx-lightbox';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MaterialModule } from 'src/app/app.module';
import { NgxMaskModule } from 'ngx-mask';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonService } from 'src/app/core/services/common.service';



@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    WidgetModule,
    CountToModule,
    SharedModule,
    NgApexchartsModule,
    SimplebarAngularModule,
    CarouselModule,
    FeatherModule.pick(allIcons),
    RouterModule,
    NgbDropdownModule,
    NgbNavModule,
    LightboxModule,
    LeafletModule,
    MaterialModule,
    NgxMaskModule,
    CommonPipeModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  providers: [CommonService, DatePipe]
})
export class DashboardModule { }
