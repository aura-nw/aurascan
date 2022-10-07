import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ChartStatsComponent} from "src/app/pages/statistics/chart-stats/chart-stats.component";
import {TopStatisticsComponent} from "src/app/pages/statistics/top-statistics/top-statistics.component";
import {ChartDetailComponent} from "src/app/pages/statistics/chart-detail/chart-detail.component";

const routes: Routes = [
  {
    path: 'charts-stats',
    component: ChartStatsComponent
  },
  {
    path: 'top-statistic',
    component: TopStatisticsComponent
  },
  {
    path: 'chart/:type',
    component: ChartDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatisticsRoutingModule { }
