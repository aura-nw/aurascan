import { Component, OnInit } from '@angular/core';
import {ChartOptions} from "src/app/core/models/chart.model";
import {HttpClient} from "@angular/common/http";
import {NgxToastrService} from "src/app/core/services/ngx-toastr.service";
import {TranslateService} from "@ngx-translate/core";
import {createChart} from "lightweight-charts";
import {STATISTIC_CHART_OPTIONS} from "../statistic-chart-options";
import {StatisticService} from "src/app/core/services/statistic.service";
@Component({
  selector: 'app-chart-stats',
  templateUrl: './chart-stats.component.html',
  styleUrls: ['./chart-stats.component.scss']
})
export class ChartStatsComponent implements OnInit {
  public chartOption: Partial<ChartOptions> = STATISTIC_CHART_OPTIONS;
  chartID = ['dailyTransactionChart', 'uniqueAddressChart', 'dailyAddressChart']

  dailyTransactionChart;
  dailyTransactionChartData;
  dailyTransactionChartSeries;

  uniqueAddressChart;
  uniqueAddressChartData;
  uniqueAddressChartSeries;

  dailyAddressChart;
  dailyAddressChartData;
  dailyAddressChartSeries;
  min = 0;
  max = 99999;

  constructor(
      private http: HttpClient,
      private toastr: NgxToastrService,
      public translate: TranslateService,
      private statisticService: StatisticService,
  ) { }

  ngOnInit() {
    this.dailyTransactionChartInit();
    this.uniqueAddressChartInit();
    this.dailyAddressChartInit();
    this.getDailyTransactionData();
    this.getUniqueAddressData();
    this.getDailyAddressData();
  }

  dailyTransactionChartInit() {
    // config chart
    this.dailyTransactionChart = createChart(document.getElementById('dailyTransactionChart'), {
      height: 300,
      crosshair: {
        horzLine: {
          visible: false,
        },
      },
      layout: {
        backgroundColor: '#363843',
        textColor: '#FFFFFF',
      },
      grid: {
        vertLines: {
          visible: false
        },
        horzLines: {
          visible: false
        },
      },
      leftPriceScale: {
        visible: true,
        borderColor: '#494C58'
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        timeVisible: false,
        secondsVisible: false,
        borderColor: '#494C58'
      },
    });
    this.dailyTransactionChartSeries = this.dailyTransactionChart.addAreaSeries({
      autoscaleInfoProvider: () => ({
        priceRange: {
          minValue: this.min,
          maxValue: this.max,
        },
      }),
    });
    this.dailyTransactionChartSeries.applyOptions({
      lineColor: '#2CB1F5',
      topColor: 'rgba(136,198,203,0.12)',
      bottomColor: 'rgba(119, 182, 188, 0.01)',
    });
  }
  uniqueAddressChartInit() {
    // config chart
    this.uniqueAddressChart = createChart(document.getElementById('uniqueAddressChart'), {
      height: 300,
      crosshair: {
        horzLine: {
          visible: false,
        },
      },
      layout: {
        backgroundColor: '#363843',
        textColor: '#FFFFFF',
      },
      grid: {
        vertLines: {
          visible: false
        },
        horzLines: {
          visible: false
        },
      },
      leftPriceScale: {
        visible: true,
        borderColor: '#494C58'
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        timeVisible: false,
        secondsVisible: false,
        borderColor: '#494C58'
      },
    });
    this.uniqueAddressChartSeries = this.uniqueAddressChart.addAreaSeries({
      autoscaleInfoProvider: () => ({
        priceRange: {
          minValue: this.min,
          maxValue: this.max,
        },
      }),
    });
    this.uniqueAddressChartSeries.applyOptions({
      lineColor: '#2CB1F5',
      topColor: 'rgba(44, 177, 245, 0.2)',
      bottomColor: 'rgba(44, 177, 245, 0.08)',
    });
  }
  dailyAddressChartInit() {
    // config chart
    this.dailyAddressChart = createChart(document.getElementById('dailyAddressChart'), {
      height: 300,
      crosshair: {
        horzLine: {
          visible: false,
        },
      },
      layout: {
        backgroundColor: '#363843',
        textColor: '#FFFFFF',
      },
      grid: {
        vertLines: {
          visible: false
        },
        horzLines: {
          visible: false
        },
      },
      leftPriceScale: {
        visible: true,
        borderColor: '#494C58'
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#494C58'
      },
    });
    this.dailyAddressChartSeries = this.dailyAddressChart.addAreaSeries({
      autoscaleInfoProvider: () => ({
        priceRange: {
          minValue: this.min,
          maxValue: this.max,
        },
      }),
    });
    this.dailyAddressChartSeries.applyOptions({
      lineColor: '#2CB1F5',
      topColor: 'rgba(44, 177, 245, 0.2)',
      bottomColor: 'rgba(44, 177, 245, 0)',
    });
  }

  drawChart(data, dateTime, type: 'dailyTrans' | 'dailyAddress' | 'uniqueAddress') {
    let arr = []; // drawing chart array

    // convert timeStamp to UNIX Timestamp format (for hour timeBar)
    dateTime.forEach((date, index) => {
      const ts = Math.floor(new Date(date).getTime() / 1000);
      const temp = { value: data[index], time: ts + 25200 }; // GMT+7
      arr.push(temp);
    });
    switch (type) {
      case 'dailyTrans':
        this.dailyTransactionChartData = arr;
        this.dailyTransactionChartSeries.setData(arr);
        this.dailyTransactionChart.timeScale().fitContent();
        break;
      case 'dailyAddress':
        this.dailyAddressChartData = arr;
        this.dailyAddressChartSeries.setData(arr);
        this.dailyAddressChart.timeScale().fitContent();
        break;
      case 'uniqueAddress':
        this.uniqueAddressChartData = arr;
        this.uniqueAddressChartSeries.setData(arr);
        this.uniqueAddressChart.timeScale().fitContent();
        break;
    }
    this.min = Math.min(...data);
    this.max = Math.max(...data);
  }

  getDailyTransactionData() {
    const valueArr = [3781369,3784834,3784344,3784311,3712344,11784344,3712432,12784344,2284344,1234344];
    const timeArr = ['2022-10-31T00:00:00Z','2022-11-01T00:00:00Z','2022-11-02T00:00:00Z','2022-11-03T00:00:00Z','2022-11-08T00:00:00Z',
               '2022-11-09T00:00:00Z','2022-11-10T00:00:00Z', '2022-11-12T00:00:00Z', '2022-11-14T00:00:00Z', '2022-11-21T00:00:00Z' ];
    this.drawChart(valueArr, timeArr, 'dailyTrans');
  }

  getUniqueAddressData() {
    const valueArr = [3781369,3784834,3784344,3784311,3712344,11784344,3712432,12784344,2284344,1234344];
    const timeArr = ['2022-10-31T00:00:00Z','2022-11-01T00:00:00Z','2022-11-02T00:00:00Z','2022-11-03T00:00:00Z','2022-11-08T00:00:00Z',
               '2022-11-09T00:00:00Z','2022-11-10T00:00:00Z', '2022-11-12T00:00:00Z', '2022-11-14T00:00:00Z', '2022-11-21T00:00:00Z' ];
    this.drawChart(valueArr, timeArr, 'uniqueAddress');
  }

  getDailyAddressData() {
    const valueArr = [3781369,3784834,3784344,3784311,3712344,11784344,3712432,12784344,2284344,1234344];
    const timeArr = ['2022-10-31T00:00:00Z','2022-11-01T00:00:00Z','2022-11-02T00:00:00Z','2022-11-03T00:00:00Z','2022-11-08T00:00:00Z',
               '2022-11-09T00:00:00Z','2022-11-10T00:00:00Z', '2022-11-12T00:00:00Z', '2022-11-14T00:00:00Z', '2022-11-21T00:00:00Z' ];
    this.drawChart(valueArr, timeArr, 'dailyAddress');
  }

}
