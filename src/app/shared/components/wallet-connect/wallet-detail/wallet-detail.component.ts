import { NgIf } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import {
  ApexAxisChartSeries,
  ApexOptions,
  ApexPlotOptions,
  ChartComponent,
} from "ng-apexcharts";

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexFill,
  ApexDataLabels,
  ApexLegend,
} from "ng-apexcharts";

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
};

@Component({
  selector: "app-wallet-detail",
  templateUrl: "./wallet-detail.component.html",
  styleUrls: ["./wallet-detail.component.scss"],
})
export class WalletDetailComponent implements OnInit {
  @ViewChild("walletChart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  tokenSymbol = "AURA";

  balance = {
    amount: 0,
    stackedAmount: 0,
  };

  chartCustomOptions: { name: string; color: string }[] = [
    {
      name: "Available",
      color: "#11cdef",
    },
    {
      name: "Staked",
      color: "#5e72e4",
    },
  ];

  constructor() {
    this.chartOptions = {
      series: [0, 0],
      labels: this.chartCustomOptions.map((e) => e.name),
      colors: this.chartCustomOptions.map((e) => e.color),
      dataLabels: {
        enabled: false,
      },
      chart: {
        width: 280,
        type: "donut",
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
  }

  ngOnInit(): void {
    this.chartOptions.series = [100, 2];
  }
}
