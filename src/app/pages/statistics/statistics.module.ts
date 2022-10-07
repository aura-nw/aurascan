import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatisticsRoutingModule } from './statistics-routing.module';
import { ChartStatsComponent } from './chart-stats/chart-stats.component';
import { TopStatisticsComponent } from './top-statistics/top-statistics.component';
import { ChartDetailComponent } from './chart-detail/chart-detail.component';
import {SharedModule} from "src/app/shared/shared.module";
import {CommonPipeModule} from "src/app/core/pipes/common-pipe.module";
import {NgApexchartsModule} from "ng-apexcharts";
import {NgbNavModule} from "@ng-bootstrap/ng-bootstrap";
import { TopStatisticOverviewComponent } from './top-statistics/top-statistic-overview/top-statistic-overview.component';
import { TopStatisticTransactionComponent } from './top-statistics/top-statistic-transaction/top-statistic-transaction.component';


@NgModule({
  declarations: [
    ChartStatsComponent,
    TopStatisticsComponent,
    ChartDetailComponent,
    TopStatisticOverviewComponent,
    TopStatisticTransactionComponent
  ],
    imports: [
        CommonModule,
        StatisticsRoutingModule,
        SharedModule,
        CommonPipeModule,
        NgApexchartsModule,
        NgbNavModule
    ]
})
export class StatisticsModule { }
