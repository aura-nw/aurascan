import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core'
import { ChartComponent } from 'ng-apexcharts'
import { ChainsInfo, SIGNING_MESSAGE_TYPES } from 'src/app/core/constants/wallet.constant'
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service'

import { WalletService } from 'src/app/core/services/wallet.service'
import { balanceOf } from 'src/app/core/utils/common/parsing'
import { createSignBroadcast } from 'src/app/core/utils/signing/transaction-manager'
import { chartCustomOptions, ChartOptions, CHART_OPTIONS } from './wallet-chart-option'

@Component({
  selector: 'app-wallet-detail',
  templateUrl: './wallet-detail.component.html',
  styleUrls: ['./wallet-detail.component.scss'],
})
export class WalletDetailComponent implements OnInit, OnChanges {
  @Input() address: string = null
  @Input() chainId: string = null
  @Input() trigger: 'show' | 'hide' = 'hide'

  @Output() depositEvent = new EventEmitter()

  @ViewChild('walletChart') chart: ChartComponent
  public chartOptions: Partial<ChartOptions>
  tokenSymbol = 'AURA'

  balance = {
    available: 0,
    totalStaked: 0,
    totalReward: 0,
    denom: '',
  }

  delegatorList = []

  chartCustomOptions = chartCustomOptions

  isClaiming: boolean = false

  constructor(private walletService: WalletService, private toastr: NgxToastrService) {
    this.chartOptions = CHART_OPTIONS
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['trigger']) {
      if (changes['trigger']?.currentValue === 'show') {
        this.loadWalletDetail()
      }
    }
  }

  ngOnInit(): void {
    this.loadWalletDetail()
  }

  loadWalletDetail(): void {
    this.walletService.getWalletDetail(this.address).subscribe((response) => {
      if (!response) {
        return
      }
      if (response.error) {
        return
      } else {
        const { data } = response
        const { balance, delegated, stake_reward } = data
        const totalStake = delegated.delegation_responses.map((a) => a.balance.amount).reduce((a, b) => a + b)

        this.delegatorList = stake_reward.rewards.map((dta) => {
          return dta.validator_address
        })

        this.balance = {
          available: balanceOf(balance.balances[0].amount),
          totalReward: balanceOf(stake_reward.total[0].amount),
          totalStaked: +totalStake,
          denom: balance.balances[0].denom,
        }

        if (+balance.balances[0].amount !== 0) {
          this.setChartBalances(balanceOf(balance.balances[0].amount), balanceOf(totalStake))
        }
      }
    })
  }

  setChartBalances(amount: number | string, staking: number | string): void {
    this.chartOptions.series = [+amount, +staking, 0]
  }

  async clampReward() {
    this.isClaiming = true
    const { hash, error } = await createSignBroadcast({
      messageType: SIGNING_MESSAGE_TYPES.CLAIM_REWARDS,
      message: {
        amounts: [
          {
            denom: this.balance.denom,
            amount: this.balance.totalReward,
          },
        ],
        from: [...this.delegatorList],
      },
      senderAddress: this.address,
      network: ChainsInfo[this.chainId],
      signingType: 'keplr',
      chainId: this.chainId,
    })

    if (error) {
      this.toastr.error(error)
    }

    if (hash) {
      this.balance.totalReward = 0
      this.loadWalletDetail()
    }
    this.isClaiming = false
  }

  deposit(e): void {
    e.stopPropagation()
    this.depositEvent.emit()
  }
}
