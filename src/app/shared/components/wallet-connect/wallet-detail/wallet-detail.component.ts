import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { ChartComponent } from "ng-apexcharts";

import { WalletService } from "src/app/core/services/wallet.service";
import {
  chartCustomOptions,
  ChartOptions,
  CHART_OPTIONS,
} from "./wallet-chart-option";

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

  chartCustomOptions = chartCustomOptions;

  constructor(private walletService: WalletService) {
    this.chartOptions = CHART_OPTIONS;
  }

  ngOnInit(): void {
    this.walletService.getBalances(this.address).subscribe((response) => {
      if (!response) {
        return;
      }
      if (response.error) {
        return;
      } else {
        const { data } = response;

        if (+data.balance !== 0) {
          this.setChartBalances(data.balance, data.delegated);
        }
      }
    });
  }

  setChartBalances(amount: number | string, staking: number | string): void {
    this.chartOptions.series = [+amount, +staking, 0];
  }
}
