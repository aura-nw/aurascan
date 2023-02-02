import { Component, OnInit } from '@angular/core';
import {AURA_TOP_STATISTIC_RANGE} from "src/app/core/constants/chart.constant";
import {StatisticService} from "src/app/core/services/statistic.service";
import {formatDate} from '@angular/common';

@Component({
  selector: 'app-top-statistic-overview',
  templateUrl: './top-statistic-overview.component.html',
  styleUrls: ['./top-statistic-overview.component.scss']
})
export class TopStatisticOverviewComponent implements OnInit {
  rangeList = AURA_TOP_STATISTIC_RANGE;
  currentRange = AURA_TOP_STATISTIC_RANGE.D_1;
  currentDay;
  preDay;
  loading = true;
  transactionsData;
  constructor(
    private statisticService: StatisticService,
    ) { }

  ngOnInit(): void {
    this.currentDay = formatDate(Date.now(),'dd-MMM','en-US');
    this.getTransactionData(this.currentRange);
  }

  getTransactionData(time: string) {
    this.currentRange = time;
    let day = new Date();
    day.setDate(day.getDate() - (+this.currentRange));
    this.preDay = formatDate(day,'dd-MMM','en-US');
    this.statisticService.getListAccountStatistic(this.currentRange, 1).subscribe(res => {
      this.loading = true;
      if(res && res.data) {
        this.transactionsData = res.data;
      } else {
        this.transactionsData = null;
      }
      this.loading = false;
    })
  }
}
