import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexFill,
  ApexLegend,
  ApexDataLabels,
  ApexPlotOptions,
  ApexStates,
  ApexTooltip,
} from "ng-apexcharts";

export const CHART_NO_VALUE = [0, 0, 1];

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
  states: ApexStates;
  tooltip: ApexTooltip;
};

export const chartCustomOptions: { name: string; color: string }[] = [
  {
    name: "Available",
    color: "#11cdef",
  },
  {
    name: "Staked",
    color: "#5e72e4",
  },
];

export const CHART_OPTIONS: Partial<ChartOptions> = {
  series: CHART_NO_VALUE,
  labels: chartCustomOptions.map((e) => e.name).concat("Total"),
  colors: chartCustomOptions.map((e) => e.color).concat("#ced4da"),
  dataLabels: {
    enabled: false,
  },
  chart: {
    width: 280,
    type: "donut",
  },
  states: {
    hover: {
      filter: {
        type: "none",
      },
    },
    active: {
      filter: {
        type: "none",
      },
    },
  },
  tooltip: {
    enabled: false,
  },
  plotOptions: {
    pie: {
      startAngle: 180,
      endAngle: -180,
      expandOnClick: false,
      offsetX: 0,
      offsetY: 0,
      customScale: 1,
      dataLabels: {
        offset: 0,
        minAngleToShowLabel: 1,
      },
      donut: {
        size: "85%",
        labels: {
          show: true,
          total: {
            show: true,
            showAlways: true,
            label: "Total Balance",
            fontSize: "18px",
            fontFamily: "Helvetica, Arial, sans-serif",
            fontWeight: 600,
            color: "#373d3f",
            formatter: function (w) {
              return Number(
                w.globals.seriesTotals.reduce(
                  (
                    previousValue: number,
                    currentValue: number,
                    index: number
                  ) => {
                    if (index === 2) {
                      return previousValue;
                    }
                    return previousValue + currentValue;
                  },
                  0
                )
              )
                .toFixed(1)
                .toString();
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
                  fontSize: "14px",
                },
              },
            },
          },
        },
      },
    },
  ],
};
