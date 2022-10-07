import { Component, OnInit } from '@angular/core';
import {ChartOptions} from "src/app/core/models/chart.model";
import {HttpClient} from "@angular/common/http";
import {AURA_PRICE_CHART_RANGE} from "src/app/core/constants/chart.constant";
import {NgxToastrService} from "src/app/core/services/ngx-toastr.service";
import {TranslateService} from "@ngx-translate/core";
@Component({
  selector: 'app-chart-stats',
  templateUrl: './chart-stats.component.html',
  styleUrls: ['./chart-stats.component.scss']
})
export class ChartStatsComponent implements OnInit {
  chartConfig: any = require('../../../../assets/config/charts.json');
  // price chart
  priceChartOptions: Partial<ChartOptions>;
  priceChartRangeData = AURA_PRICE_CHART_RANGE;
  priceChartRange = AURA_PRICE_CHART_RANGE.H_24;
  // daily transaction chart
  dailyTransactionChartOptions: Partial<ChartOptions>;
  // unique address chart
  uniqueAddressChartOptions: Partial<ChartOptions>;
  // active address chart
  dailyAddressChartOptions: Partial<ChartOptions>;

  constructor(
      private http: HttpClient,
      private toastr: NgxToastrService,
      public translate: TranslateService,
  ) { }

  async ngOnInit() {
    this.priceChartOptions = this.chartConfig?.auraPrice
    this.dailyTransactionChartOptions = this.chartConfig?.auraDailyTransaction
    this.uniqueAddressChartOptions = this.chartConfig?.auraUniqueAddress
    this.dailyAddressChartOptions = this.chartConfig?.auraActiveAddress
    this.setOverrideConfig();
  }

  triggerChartMenuClick(){
    const chartMenuIcon = document.querySelector('.apexcharts-menu-icon') as HTMLElement | null;
    if(chartMenuIcon) {
      chartMenuIcon?.click();
    } else {
      this.toastr.warning(this.translate.instant('NOTICE.CHART_WAIT_DATA'))
    }
  }

  setOverrideConfig() {
    this.dailyTransactionChartOptions.chart.height = 300;
    this.uniqueAddressChartOptions.chart.height = 300;
    this.dailyAddressChartOptions.chart.height = 300;
  }

  setPriceChartData(type: string) {
    this.priceChartRange = type;
    // call api update chart
    this.priceChartOptions.series = [
      {
        name: 'transactions',
        type: 'line',
        data: null, //here
        color: '#5EE6D0',
      },
    ];
    this.priceChartOptions.xAxis = {
      type: 'datetime',
      categories: null, //here
      labels: {
        datetimeUTC: false,
      },
      axisBorder: {
        show: true,
        color: '#FFA741',
      },
    };
  }

}
