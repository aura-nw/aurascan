import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AURA_TOP_STATISTIC_RANGE } from 'src/app/core/constants/chart.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { StatisticService } from 'src/app/core/services/statistic.service';

@Component({
  selector: 'app-top-statistic-overview',
  templateUrl: './top-statistic-overview.component.html',
  styleUrls: ['./top-statistic-overview.component.scss'],
})
export class TopStatisticOverviewComponent implements OnInit {
  rangeList = AURA_TOP_STATISTIC_RANGE;
  currentRange = AURA_TOP_STATISTIC_RANGE.Range1;
  currentDay;
  preDay;
  loading = true;
  transactionsData;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinDecimals = this.environmentService.configValue.chain_info.currencies[0].coinDecimals;

  constructor(
    private statisticService: StatisticService,
    private environmentService: EnvironmentService,
    public commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.currentDay = formatDate(Date.now(), 'dd-MMM', 'en-US');
    setTimeout(() => {
      this.getTransactionData(this.currentRange);
    }, 500);
  }

  getTransactionData(time: string) {
    this.currentRange = time;
    let day = new Date();
    day.setDate(day.getDate() - +this.currentRange);
    this.preDay = formatDate(day, 'dd-MMM', 'en-US');
    let filterValue = 'three_days';
    if (time === AURA_TOP_STATISTIC_RANGE.Range2) {
      filterValue = 'fifteen_days';
    } else if (time === AURA_TOP_STATISTIC_RANGE.Range3) {
      filterValue = 'thirty_days';
    }

    this.statisticService.getListAccountStatistic().subscribe(
      (res) => {
        this.transactionsData = res[filterValue];
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
  }
}
