import { ChartOptions, DeepPartial, SeriesPartialOptionsMap } from 'lightweight-charts';
import { RangeType } from 'src/app/core/models/common.model';

export const DASHBOARD_CHART_OPTIONS: DeepPartial<ChartOptions> = {
  height: 300,
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
    minBarSpacing: 0,
  },
  handleScale: {
    mouseWheel: false,
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

export const STATISTIC_CHART_DETAIL_OPTIONS: DeepPartial<ChartOptions> = {
  height: 300,
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
    minBarSpacing: 0,
  },
};

export const STATISTIC_AREA_SERIES_CHART_OPTIONS: SeriesPartialOptionsMap['Area'] = {
  lineColor: '#2CB1F5',
  topColor: 'rgba(44, 177, 245, 0.2)',
  bottomColor: 'rgba(44, 177, 245, 0.08)',
  priceFormat: {
    precision: 0,
    minMove: 1,
  },
};

export const CHART_CONFIG: {
  [key: string]: {
    initRange: number;
    type: RangeType;
    value: number;
    unit: string;
    step: number;
  };
} = {
  ['24h']: {
    initRange: 24 * 60 * 12, // 1 day
    type: RangeType.minute,
    value: 24, // 1 day
    unit: 'h',
    step: 9,
  },
  ['7d']: {
    initRange: 168, // 1 weeks
    type: RangeType.hour,
    value: 168 * 4, // 4 weeks
    unit: 'h',
    step: 1,
  },
  ['30d']: {
    initRange: 30,
    type: RangeType.hour,
    value: 100, // 100 days
    unit: 'd',
    step: 4,
  },
  ['12M']: {
    initRange: 365,
    type: RangeType.day,
    value: 400, // 400 days
    unit: 'd',
    step: 1,
  },
};
