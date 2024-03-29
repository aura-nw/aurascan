import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { StatisticService } from 'src/app/core/services/statistic.service';
import { MaterialModule } from 'src/app/material.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChartDetailComponent } from './chart-detail/chart-detail.component';
import { ChartStatsComponent } from './chart-stats/chart-stats.component';
import { StatisticsRoutingModule } from './statistics-routing.module';
import { TopStatisticOverviewComponent } from './top-statistics/top-statistic-overview/top-statistic-overview.component';
import { TopStatisticTransactionComponent } from './top-statistics/top-statistic-transaction/top-statistic-transaction.component';
import { TopStatisticsComponent } from './top-statistics/top-statistics.component';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';

@NgModule({
  declarations: [
    ChartStatsComponent,
    TopStatisticsComponent,
    ChartDetailComponent,
    TopStatisticOverviewComponent,
    TopStatisticTransactionComponent,
  ],
  imports: [
    CommonModule,
    StatisticsRoutingModule,
    SharedModule,
    CustomPipeModule,
    NgApexchartsModule,
    NgbNavModule,
    TranslateModule,
    TableNoDataModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NameTagModule,
    MaterialModule,
    CommonDirectiveModule
  ],
  providers: [StatisticService, provideEnvironmentNgxMask(MASK_CONFIG), NgxMaskPipe],
})
export class StatisticsModule {}
