import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { AURA_TOP_STATISTIC_RANGE } from 'src/app/core/constants/chart.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { StatisticService } from 'src/app/core/services/statistic.service';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-top-statistic-transaction',
  templateUrl: './top-statistic-transaction.component.html',
  styleUrls: ['./top-statistic-transaction.component.scss'],
})
export class TopStatisticTransactionComponent implements OnInit {
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinDecimals = this.environmentService.configValue.chain_info.currencies[0].coinDecimals;
  rangeList = AURA_TOP_STATISTIC_RANGE;
  currentRange = AURA_TOP_STATISTIC_RANGE.Range1;
  currentDay;
  preDay;
  loading = true;
  transactionsData;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'rank', headerCellDef: 'rank' },
    { matColumnDef: 'address', headerCellDef: 'address' },
    { matColumnDef: 'total', headerCellDef: 'total' },
    { matColumnDef: 'percentage', headerCellDef: 'percentage' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);

  AURASendersDS = new MatTableDataSource<any>();

  AURAReceiversDS = new MatTableDataSource<any>();

  TxnCountSentDS = new MatTableDataSource<any>();

  TxnCountReceivedDS = new MatTableDataSource<any>();

  constructor(
    public global: Globals,
    private statisticService: StatisticService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.currentDay = formatDate(Date.now(), 'dd-MMM', 'en-US');
    this.getTransactionData(this.currentRange.toString());
  }

  getTransactionData(time: string) {
    this.currentRange = time;
    let day = new Date();
    day.setDate(day.getDate() - +this.currentRange);
    this.preDay = formatDate(day, 'dd-MMM', 'en-US');
    let filterValue = 'three_days';
    if (time === AURA_TOP_STATISTIC_RANGE.Range2) {
      filterValue = 'fifteen_days';
    } else if (time === AURA_TOP_STATISTIC_RANGE.Range3) {
      filterValue = 'thirty_days';
    }

    this.statisticService.getListAccountStatistic().subscribe(
      (res) => {
        if (res && res[filterValue]) {
          this.transactionsData = res[filterValue];
          this.AURASendersDS.data = res[filterValue]?.top_amount_sent;
          this.AURAReceiversDS.data = res[filterValue]?.top_amount_received;
          this.TxnCountSentDS.data = res[filterValue]?.top_tx_sent;
          this.TxnCountReceivedDS.data = res[filterValue]?.top_gas_used;
        } else {
          this.transactionsData = null;
        }
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
  }
}
