import { Component, Input, OnInit, ViewChild } from "@angular/core";
import {
  ApexPlotOptions,
  ApexStates,
  ApexTooltip,
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
import { WalletService } from "src/app/core/services/wallet.service";

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

@Component({
  selector: "app-wallet-detail",
  templateUrl: "./wallet-detail.component.html",
  styleUrls: ["./wallet-detail.component.scss"],
})
export class WalletDetailComponent implements OnInit {
  @Input() address: string = null;

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

  constructor(private walletService: WalletService) {
    this.chartOptions = {
      series: [0, 0],
      labels: this.chartCustomOptions.map((e) => e.name).concat("Total"),
      colors: this.chartCustomOptions.map((e) => e.color).concat("#ced4da"),
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
                  return w.globals.seriesTotals.reduce(
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
                  );
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
    this.chartOptions.series = [0, 0, 100];
    this.walletService.getBalances(this.address).subscribe((response) => {
      if (!response) {
        return;
      }
      if (response.error) {
        return;
      } else {
        const { data } = response;

        if (+data.balance === 0) {
          this.chartOptions.series = [0, 0, 100];
        } else {
          this.chartOptions.series = [+data.balance, data.delegated];
        }
      }
    });
  }
}
