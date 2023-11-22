import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChartStatsComponent } from 'src/app/pages/statistics/chart-stats/chart-stats.component';
import { TopStatisticsComponent } from 'src/app/pages/statistics/top-statistics/top-statistics.component';
import { ChartDetailComponent } from 'src/app/pages/statistics/chart-detail/chart-detail.component';
import { isEnabled } from 'src/app/app-routing.module';
import { EFeature } from 'src/app/core/models/common.model';

const routes: Routes = [
  {
    path: 'charts-stats',
    component: ChartStatsComponent,
    canMatch: [() => isEnabled(EFeature.Statistics)],
  },
  {
    path: 'top-statistic',
    component: TopStatisticsComponent,
    canMatch: [() => isEnabled(EFeature.Statistics)],
  },
  {
    path: 'chart/:type',
    component: ChartDetailComponent,
    canMatch: [() => isEnabled(EFeature.Statistics)],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatisticsRoutingModule {}
