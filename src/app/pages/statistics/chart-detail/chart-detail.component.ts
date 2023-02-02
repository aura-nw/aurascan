import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {NgxToastrService} from "src/app/core/services/ngx-toastr.service";
import {TranslateService} from "@ngx-translate/core";
import {StatisticService} from "src/app/core/services/statistic.service";
import {createChart, IChartApi, ISeriesApi} from "lightweight-charts";
import {CHART_CONFIG, DASHBOARD_AREA_SERIES_CHART_OPTIONS, DASHBOARD_CHART_OPTIONS} from "src/app/pages/dashboard/dashboard-chart-options";
import {debounceTime, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {CHART_RANGE} from "src/app/core/constants/common.constant";
import {timeToUnix} from "src/app/core/helpers/date";
import {DatePipe, formatDate} from "@angular/common";
import {exportStatisticChart} from 'src/app/core/helpers/export';
import * as moment from "moment";

@Component({
  selector: 'app-chart-detail',
  templateUrl: './chart-detail.component.html',
  styleUrls: ['./chart-detail.component.scss']
})
export class ChartDetailComponent implements OnInit, OnDestroy {
  chartRange = CHART_RANGE.MONTH_12;
  chartType: string;
  chartName: string;
  theTitle: string;
  chart: IChartApi = null;
  areaSeries: ISeriesApi<'Area'> = null;
  logicalRangeChange$ = new Subject<{ from: number; to: number }>();
  endData = false;
  destroy$ = new Subject();
  payloadChartType;
  prevYearNumber = 1;
  originalData = [];

  maxAmount = 0;
  minAmount = 0;
  maxAmountDate;
  minAmountDate;

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private toastr: NgxToastrService,
      public translate: TranslateService,
      private statisticService: StatisticService,
      public datepipe: DatePipe,
  ) {
    this.chartType = this.route.snapshot.paramMap.get('type');
    if(this.chartType !== 'daily-transactions' && this.chartType !== 'unique-addresses' && this.chartType !== 'cumulative-addresses') {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.setDataWithChartType();
    this.getChartInfo(this.chartRange);

  }

  setDataWithChartType() {
    switch (this.chartType) {
      case 'daily-transactions':
        this.theTitle = 'Aura Daily Transactions Chart';
        this.chartName = 'Transactions per Day';
        this.payloadChartType = 'daily_txs';
        break;
      case 'unique-addresses':
        this.theTitle = 'Aura Unique Addresses Chart';
        this.chartName = 'Aura cumulative Address Growth';
        this.payloadChartType = 'unique_addresses';
        break;
      case 'cumulative-addresses':
        this.theTitle = 'Active Aura Addresses Chart';
        this.chartName = 'Active Aura addresses per day';
        this.payloadChartType = 'daily_active_addresses';
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
    this.initChart();
  }

  // config chart
  initChart() {
    this.chart = createChart(document.getElementById('dailyChart'), DASHBOARD_CHART_OPTIONS);
    this.areaSeries = this.chart.addAreaSeries(DASHBOARD_AREA_SERIES_CHART_OPTIONS);
    // this.initTooltip();
    this.subscribeVisibleLogicalRangeChange();
  }

  subscribeVisibleLogicalRangeChange() {
    this.logicalRangeChange$.pipe(debounceTime(500), takeUntil(this.destroy$)).subscribe(({ from, to }) => {
      if (from <= 0 && !this.endData) {
        this.prevYearNumber++;
        const currTime = new Date();
        const max = Date.parse(currTime + "");
        const prevTime = new Date(currTime.getFullYear() - this.prevYearNumber, 0, 1);
        const min = Date.parse(prevTime + "");

        this.statisticService.getDailyTxStatistic(this.payloadChartType, min, max).subscribe(res => {
          if(res?.data?.extremeData) {
            this.minAmount = res?.data?.extremeData?.min?.amount;
            this.maxAmount = res?.data?.extremeData?.max?.amount;
            const dayMin = new Date(res?.data?.extremeData?.min?.date);
            const dayMax = new Date(res?.data?.extremeData?.max?.date);
            this.minAmountDate = formatDate(dayMin,'dd/MM/yyyy','en-US');
            this.maxAmountDate = formatDate(dayMax,'dd/MM/yyyy','en-US');
          }
          if(res?.data?.dailyData?.length > 0) {
            let dataY = [];
            let dataX = [];
            res.data.dailyData.forEach(data => {
              if(this.payloadChartType === 'daily_txs') {
                dataX.push(data.daily_txs);
              }
              if(this.payloadChartType === 'unique_addresses') {
                dataX.push(data.unique_addresses);
              }
              if(this.payloadChartType === 'daily_active_addresses') {
                dataX.push(data.daily_active_addresses);
              }
              dataY.push(data.date);
            });
            const chartData = this.makeChartData(dataX, dataY);
            if(this.originalData.length === chartData.length) {
              this.endData = true;
            }
            // @ts-ignore
            this.areaSeries.setData(chartData);
          }
        })
      }
    });
  }

  getChartInfo(type: string) {
    this.endData = false;
    // this.initTooltip();
    this.chartRange = type;
    const currTime = new Date();
    const max = Date.parse(currTime + "");
    const prevTime = new Date(currTime.getFullYear() -1, 0, 1);
    const min = Date.parse(prevTime + "");

    this.statisticService.getDailyTxStatistic(this.payloadChartType, min, max).subscribe(res => {
      if(res?.data?.extremeData) {
        this.minAmount = res?.data?.extremeData?.min?.amount;
        this.maxAmount = res?.data?.extremeData?.max?.amount;
        const dayMin = new Date(res?.data?.extremeData?.min?.date);
        const dayMax = new Date(res?.data?.extremeData?.max?.date);
        this.minAmountDate = formatDate(dayMin,'dd/MM/yyyy','en-US');
        this.maxAmountDate = formatDate(dayMax,'dd/MM/yyyy','en-US');
      }
      if(res?.data?.dailyData?.length > 0) {
        let dataY = [];
        let dataX = [];
        res.data.dailyData.forEach(data => {
          if(this.payloadChartType === 'daily_txs') {
            dataX.push(data.daily_txs);
          }
          if(this.payloadChartType === 'unique_addresses') {
            dataX.push(data.unique_addresses);
          }
          if(this.payloadChartType === 'daily_active_addresses') {
            dataX.push(data.daily_active_addresses);
          }
          dataY.push(data.date);
        });
        this.drawChartFirstTime(dataX, dataY);
        this.chartEvent();
      }
    })
  }

  drawChartFirstTime(data, dateTime) {
    let arr = []; // drawing chart array
    arr = this.makeChartData(data, dateTime);
    this.originalData = arr;
    this.areaSeries.setData(arr);
    const chartLength = arr.length - 1;
    if (chartLength <= CHART_CONFIG[this.chartRange].initRange) {
      this.chart.timeScale().fitContent();
    } else {
      this.chart.timeScale().setVisibleLogicalRange({
        from: chartLength - CHART_CONFIG[this.chartRange].initRange,
        to: chartLength,
      });
    }
    this.chart.priceScale().applyOptions({
      autoScale: true,
    });
  }

  makeChartData(data: number[], time: any[]) {
    return time.map((el, index) => ({
      value: data[index],
      time: timeToUnix(el, 25200), // 2520s GMT+7
    }));
  }

  chartEvent() {
    this.chart.timeScale().subscribeVisibleLogicalRangeChange(({ from, to }) => {
      this.logicalRangeChange$.next({ from, to });
    });
  }

  exportChart() {
    console.log(this.originalData);
    const exportData = this.originalData.map((item) => {
      const dateF = this.datepipe.transform(new Date(item.time *1000), 'dd-MM-yyyy:HH-mm-ss');
      return {
        date: dateF,
        value: item.value,
      };
    });
    console.log(exportData)
    const currDate = moment(new Date()).format('DDMMYYYY_HHMMSS');

    exportStatisticChart(
      [
        {
          table1: exportData,
        },
      ],
      this.chartType,
      currDate,
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
