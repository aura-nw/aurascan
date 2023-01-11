import { ChartOptions, DeepPartial, ISeriesApi, SeriesPartialOptionsMap } from 'lightweight-charts';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexStroke, ApexTooltip, ApexDataLabels } from 'ng-apexcharts';

// export type ChartOptions = {
//   series: ApexAxisChartSeries;
//   chart: ApexChart;
//   xAxis: ApexXAxis;
//   stroke: ApexStroke;
//   tooltip: ApexTooltip;
//   dataLabels: ApexDataLabels;
// };

// export const DASHBOARD_CHART_OPTIONS: Partial<ChartOptions> = {
//   series: [
//     {
//       name: 'transactions',
//       type: 'line',
//       data: [],
//       color: '#5EE6D0',
//     },
//   ],
//   chart: {
//     height: 333,
//     type: 'area',
//     toolbar: {
//       tools: {
//         selection: false,
//         download: `<i class="icon icon-download"></i>`,
//         zoom: false,
//         zoomin: `<i class="icon icon-plus-circle"></i>`,
//         zoomout: `<i class="icon icon-minus-circle"></i>`,
//         pan: false,
//         reset: false,
//       },
//     },
//   },
//   dataLabels: {
//     enabled: false,
//   },
//   stroke: {
//     width: 3,
//     curve: 'smooth',
//   },
//   xAxis: {
//     type: 'datetime',
//     categories: [],
//     labels: {
//       datetimeUTC: false,
//     },
//     axisBorder: {
//       show: true,
//       color: '#FFA741',
//     },
//   },
//   tooltip: {
//     x: {
//       format: 'dd/MM/yy HH:mm',
//     },
//   },
// };

export const DASHBOARD_CHART_OPTIONS: DeepPartial<ChartOptions> = {
  height: 244,
  crosshair: {
    horzLine: {
      visible: false,
    },
  },
  layout: {
    backgroundColor: '#24262e',
    textColor: '#868a97',
  },
  grid: {
    vertLines: {
      color: '#363843',
    },
    horzLines: {
      color: '#363843',
    },
  },
  leftPriceScale: {
    visible: true,
  },
  rightPriceScale: {
    visible: false,
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: true,
    fixRightEdge: true,
  },
};

export const DASHBOARD_AREA_SERIES_CHART_OPTIONS: SeriesPartialOptionsMap['Area'] = {
  lineColor: '#5EE6D0',
  topColor: 'rgba(136,198,203,0.12)',
  bottomColor: 'rgba(119, 182, 188, 0.01)',
  priceFormat: {
    type: 'price',
    precision: 4,
    minMove: 0.0001,
  },
};
