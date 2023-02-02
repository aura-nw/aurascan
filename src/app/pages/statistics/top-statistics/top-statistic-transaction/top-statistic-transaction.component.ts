import { Component, OnInit } from '@angular/core';
import {AURA_TOP_STATISTIC_RANGE} from "src/app/core/constants/chart.constant";
import {MatTableDataSource} from "@angular/material/table";
import {TableTemplate} from "src/app/core/models/common.model";
import {Globals} from "src/app/global/global";
import {formatDate} from "@angular/common";
import {StatisticService} from "src/app/core/services/statistic.service";

@Component({
  selector: 'app-top-statistic-transaction',
  templateUrl: './top-statistic-transaction.component.html',
  styleUrls: ['./top-statistic-transaction.component.scss']
})
export class TopStatisticTransactionComponent implements OnInit {
  rangeList = AURA_TOP_STATISTIC_RANGE;
  currentRange = AURA_TOP_STATISTIC_RANGE.D_1;
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
  ) {}

  ngOnInit(): void {
    this.currentDay = formatDate(Date.now(),'dd-MMM','en-US');
    this.getTransactionData(this.currentRange)
  }

  getTransactionData(time: string) {
    this.currentRange = time;
    let day = new Date();
    day.setDate(day.getDate() - (+this.currentRange));
    this.preDay = formatDate(day,'dd-MMM','en-US');
    this.statisticService.getListAccountStatistic(this.currentRange, 10).subscribe(res => {
      this.loading = true;
      if(res && res.data) {
        this.transactionsData = res.data;
        this.AURASendersDS.data = res.data.top_aura_senders
        this.AURAReceiversDS.data = res.data.top_aura_receivers
        this.TxnCountSentDS.data = res.data.top_txn_count_sent
        this.TxnCountReceivedDS.data = res.data.top_txn_count_received
      } else {
        this.transactionsData = null;
      }
      this.loading = false;
    })
  }

}
