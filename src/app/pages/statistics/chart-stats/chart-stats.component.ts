import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { createChart } from 'lightweight-charts';
import { ChartOptions } from 'src/app/core/models/chart.model';
import { StatisticService } from 'src/app/core/services/statistic.service';
import { STATISTIC_CHART_OPTIONS } from '../statistic-chart-options';
@Component({
  selector: 'app-chart-stats',
  templateUrl: './chart-stats.component.html',
  styleUrls: ['./chart-stats.component.scss'],
})
export class ChartStatsComponent implements OnInit {
  public chartOption: Partial<ChartOptions> = STATISTIC_CHART_OPTIONS;
  chartID = ['dailyTransactionChart', 'uniqueAddressChart', 'dailyAddressChart'];

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

  currTime = new Date();
  currTimeMs = Date.parse(this.currTime + '');
  prevTime = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
  prevTimeMs = Date.parse(this.prevTime + '');

  constructor(public translate: TranslateService, private statisticService: StatisticService) {}

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
          visible: false,
        },
        horzLines: {
          visible: true,
          color: '#494C58',
        },
      },
      leftPriceScale: {
        visible: true,
        borderColor: '#494C58',
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        timeVisible: false,
        secondsVisible: false,
        borderColor: '#494C58',
      },
    });
    this.dailyTransactionChartSeries = this.dailyTransactionChart.addAreaSeries({});

    this.dailyTransactionChartSeries.applyOptions({
      lineColor: '#2CB1F5',
      topColor: 'rgba(136,198,203,0)',
      bottomColor: 'rgba(119, 182, 188, 0)',
      priceFormat: {
        type: 'price',
        precision: 0,
        minMove: 1,
      },
    });

    this.dailyTransactionChart.priceScale().applyOptions({
      autoScale: true,
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
          visible: false,
        },
        horzLines: {
          visible: true,
          color: '#494C58',
        },
      },
      leftPriceScale: {
        visible: true,
        borderColor: '#494C58',
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        timeVisible: false,
        secondsVisible: false,
        borderColor: '#494C58',
      },
    });
    this.uniqueAddressChartSeries = this.uniqueAddressChart.addAreaSeries({});
    this.uniqueAddressChartSeries.applyOptions({
      lineColor: '#2CB1F5',
      topColor: 'rgba(44, 177, 245, 0.2)',
      bottomColor: 'rgba(44, 177, 245, 0.08)',
      priceFormat: {
        type: 'price',
        precision: 0,
        minMove: 1,
      },
    });
    this.uniqueAddressChart.priceScale().applyOptions({
      autoScale: true,
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
          visible: false,
        },
        horzLines: {
          visible: true,
          color: '#494C58',
        },
      },
      leftPriceScale: {
        visible: true,
        borderColor: '#494C58',
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#494C58',
      },
    });
    this.dailyAddressChartSeries = this.dailyAddressChart.addAreaSeries({});
    this.dailyAddressChartSeries.applyOptions({
      lineColor: '#2CB1F5',
      topColor: 'rgba(44, 177, 245, 0)',
      bottomColor: 'rgba(44, 177, 245, 0)',
      priceFormat: {
        type: 'price',
        precision: 0,
        minMove: 1,
      },
    });
    this.dailyAddressChart.priceScale().applyOptions({
      autoScale: true,
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
    this.statisticService.getDailyTxStatistic('daily_txs', this.prevTimeMs, this.currTimeMs).subscribe((res) => {
      let valueArr = [];
      let timeArr = [];
      res.data.dailyData.forEach((data) => {
        valueArr.push(data.daily_txs);
        timeArr.push(data.date);
      });
      this.drawChart(valueArr, timeArr, 'dailyTrans');
    });
  }

  getUniqueAddressData() {
    this.statisticService.getDailyTxStatistic('unique_addresses', this.prevTimeMs, this.currTimeMs).subscribe((res) => {
      let valueArr = [];
      let timeArr = [];
      res.data.dailyData.forEach((data) => {
        valueArr.push(data.unique_addresses);
        timeArr.push(data.date);
      });
      this.drawChart(valueArr, timeArr, 'uniqueAddress');
    });
  }

  getDailyAddressData() {
    this.statisticService
      .getDailyTxStatistic('daily_active_addresses', this.prevTimeMs, this.currTimeMs)
      .subscribe((res) => {
        let valueArr = [];
        let timeArr = [];
        res.data.dailyData.forEach((data) => {
          valueArr.push(data.daily_active_addresses);
          timeArr.push(data.date);
        });
        this.drawChart(valueArr, timeArr, 'dailyAddress');
      });
  }
}
