import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ChartOptions} from "src/app/core/models/chart.model";

@Component({
  selector: 'app-chart-detail',
  templateUrl: './chart-detail.component.html',
  styleUrls: ['./chart-detail.component.scss']
})
export class ChartDetailComponent implements OnInit {
  chartType: string;
  chartName: string;
  theTitle: string;
  chartConfig: any = require('../../../../assets/config/charts.json');
  chartOptions: Partial<ChartOptions>;
  constructor(
      private route: ActivatedRoute,
      private router: Router,
  ) {
    this.chartType = this.route.snapshot.paramMap.get('type');
    if(this.chartType !== 'daily-transactions' && this.chartType !== 'unique-addresses' && this.chartType !== 'cumulative-addresses') {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.setDataWithChartType();
  }

  setDataWithChartType() {
    switch (this.chartType) {
      case 'daily-transactions':
        this.theTitle = 'Aura Daily Transactions Chart';
        this.chartName = 'Transactions per Day';
        this.chartOptions = this.chartConfig?.auraDailyTransaction
        break;
      case 'unique-addresses':
        this.theTitle = 'Aura Unique Addresses Chart';
        this.chartName = 'Aura cumulative Address Growth';
        this.chartOptions = this.chartConfig?.auraUniqueAddress
        break;
      case 'cumulative-addresses':
        this.theTitle = 'Active Aura Addresses Chart';
        this.chartName = 'Active Aura addresses per day';
        this.chartOptions = this.chartConfig?.auraActiveAddress
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }
}
