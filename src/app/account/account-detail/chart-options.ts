import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexFill,
  ApexLegend,
  ApexDataLabels,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
} from 'ng-apexcharts';
import { ACCOUNT_WALLET_COLOR } from '../../core/constants/account.constant';

export const chartCustomOptions: { name: string; color: string; amount: string }[] = ACCOUNT_WALLET_COLOR;

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  fill: ApexFill;
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  colors: string[];
  stroke: ApexStroke;
  tooltip: ApexTooltip;
};

export const CHART_OPTION = (): ChartOptions =>
  ({
    stroke: {
      width: 1,
      curve: 'smooth',
      colors: chartCustomOptions.map((e) => e.color),
    },
    tooltip: {
      custom: function ({ series, seriesIndex, w }) {
        const percent = (series[seriesIndex] * 100) / series.reduce((a, b) => a + b);
        return `
        <div class="custom-apex-tooltip"> 
          <div class="tooltip-title">
            ${w.globals.labels[seriesIndex]}
          </div>
          <div class="tooltip-percent"> ${percent.toFixed(2)}% </div>
          <div class="tooltip-amount"> ${series[seriesIndex].toLocaleString('en-US', {minimumFractionDigits: 6})}</div>
        </div>`;
      },
    },
    series: [0, 0],
    labels: chartCustomOptions.map((e) => e.name),
    colors: chartCustomOptions.map((e) => e.color),
    dataLabels: {
      enabled: false,
    },
    chart: {
      width: 261,
      type: 'donut',
    },
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        expandOnClick: false,
        offsetX: 0,
        offsetY: 0,
        customScale: 1,
        dataLabels: {
          offset: 0,
          minAngleToShowLabel: 1,
        },
        donut: {
          size: '55%',
          labels: {
            show: false,
            total: {
              show: false,
              showAlways: true,
              label: 'Total Balance',
              fontSize: '18px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 600,
              color: '#373d3f',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => {
                  return a + b;
                }, 0);
              },
            },
          },
        },
      },
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  total: {
                    fontSize: '14px',
                  },
                },
              },
            },
          },
        },
      },
    ],
  } as ChartOptions);
