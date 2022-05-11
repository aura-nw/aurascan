import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexStroke, ApexTooltip, ApexDataLabels } from "ng-apexcharts";

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xAxis: ApexXAxis;
    stroke: ApexStroke;
    tooltip: ApexTooltip;
    dataLabels: ApexDataLabels;
  };
  
export const DASHBOARD_CHART_OPTIONS: Partial<ChartOptions>= {
    series: [
      // {
      //   name: 'blocks',
      //   type: 'area',
      //   data: [],
      // },
      {
        name: 'transactions',
        type: 'line',
        data: [],
        color: '#5EE6D0',
      },
    ],
    chart: {
      height: 333,
      type: 'area',
      toolbar: {
        tools: {
          selection: false,
          download: `<i class="icon icon-download"></i>`,
          zoom: false,
          zoomin: `<i class="icon icon-plus-circle"></i>`,
          zoomout: `<i class="icon icon-minus-circle"></i>`,
          pan: false,
          reset: false,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    xAxis: {
      type: 'datetime',
      categories: [],
      labels: {
        datetimeUTC: false,
      },
      axisBorder: {
        show: true,
        color: '#FFA741',
      },
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm',
      },
    },
  };