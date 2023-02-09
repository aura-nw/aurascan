import { ChartOptions } from 'src/app/core/models/chart.model';
export const STATISTIC_CHART_OPTIONS: Partial<ChartOptions> = {
  series: [
    {
      name: 'statistic',
      type: 'line',
      data: [],
      color: '#2CB1F5',
    },
  ],
  chart: {
    height: 333,
    type: 'area',
    toolbar: {
      tools: {
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: false,
  },
  xAxis: {
    type: 'datetime',
    categories: [],
    labels: {
      datetimeUTC: false,
    },
    axisBorder: {
      show: false,
    },
  },
};
