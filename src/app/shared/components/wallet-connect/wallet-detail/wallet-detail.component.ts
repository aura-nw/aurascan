import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { ChartComponent } from "ng-apexcharts";
import { SIGNING_MESSAGE_TYPES } from "src/app/core/constants/wallet.constant";

import { WalletService } from "src/app/core/services/wallet.service";
import { balanceOf } from "src/app/core/utils/common/parsing";
import { createSignBroadcast } from "src/app/core/utils/signing/transaction-manager";
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
    available: 0,
    totalStaked: 0,
    totalReward: 0,
  };

  chartCustomOptions = chartCustomOptions;

  constructor(private walletService: WalletService) {
    this.chartOptions = CHART_OPTIONS;
  }

  ngOnInit(): void {
    this.walletService.getWalletDetail(this.address).subscribe((response) => {
      if (!response) {
        return;
      }
      if (response.error) {
        return;
      } else {
        const { data } = response;
        const { balance, delegated, stake_reward } = data;
        const totalStake = delegated.delegation_responses
          .map((a) => a.balance.amount)
          .reduce((a, b) => a + b);

        this.balance.available = balanceOf(balance.balances[0].amount);
        this.balance.totalReward = balanceOf(stake_reward.total[0].amount);
        this.balance.totalStaked = +totalStake;

        if (+balance.balances[0].amount !== 0) {
          this.setChartBalances(
            balanceOf(balance.balances[0].amount),
            balanceOf(totalStake)
          );
        }
      }
    });
  }

  setChartBalances(amount: number | string, staking: number | string): void {
    this.chartOptions.series = [+amount, +staking, 0];
  }

  clampReward(): void {
    createSignBroadcast({
      messageType: SIGNING_MESSAGE_TYPES.CLAIM_REWARDS,
      message: {
        amounts: [
          {
            denom: "AURA",
            amount: 3.802484,
          },
        ],
        from: ["auravaloper1hnyjager4zrrq6cr85cd5a7rd37z6hsp92elnw"],
      },
      senderAddress: this.address,
      accountInfo: null,
      network: null,
      signingType: null,
      password: null,
      HDPath: null,
      feeDenom: null,
      chainId: null,
      memo: null,
      ledgerTransport: null,
    });
  }
}
