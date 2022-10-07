import { Component, OnInit } from '@angular/core';
import {AURA_TOP_STATISTIC_RANGE} from "src/app/core/constants/chart.constant";

@Component({
  selector: 'app-top-statistic-overview',
  templateUrl: './top-statistic-overview.component.html',
  styleUrls: ['./top-statistic-overview.component.scss']
})
export class TopStatisticOverviewComponent implements OnInit {
  rangeList = AURA_TOP_STATISTIC_RANGE;
  currentRange = AURA_TOP_STATISTIC_RANGE.D_1;
  constructor() { }

  ngOnInit(): void {
    this.getTransactionData(this.currentRange)
  }

  getTransactionData(time: string) {
    this.currentRange = time;
  }
}
