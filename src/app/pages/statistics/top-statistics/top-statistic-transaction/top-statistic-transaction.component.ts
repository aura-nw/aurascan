import { Component, OnInit } from '@angular/core';
import {AURA_TOP_STATISTIC_RANGE} from "src/app/core/constants/chart.constant";
import {MatTableDataSource} from "@angular/material/table";
import {TableTemplate} from "src/app/core/models/common.model";
import {Globals} from "src/app/global/global";

@Component({
  selector: 'app-top-statistic-transaction',
  templateUrl: './top-statistic-transaction.component.html',
  styleUrls: ['./top-statistic-transaction.component.scss']
})
export class TopStatisticTransactionComponent implements OnInit {
  rangeList = AURA_TOP_STATISTIC_RANGE;
  currentRange = AURA_TOP_STATISTIC_RANGE.D_1;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'rank', headerCellDef: 'rank' },
    { matColumnDef: 'address', headerCellDef: 'address' },
    { matColumnDef: 'total', headerCellDef: 'total aura' },
    { matColumnDef: 'percentage', headerCellDef: 'percentage' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);

  AURASendersLoading = true;
  AURASendersDS = new MatTableDataSource<any>();

  AURAReceiversLoading = true;
  AURAReceiversDS = new MatTableDataSource<any>();

  TxnCountSentLoading = true;
  TxnCountSentDS = new MatTableDataSource<any>();

  TxnCountReceivedLoading = true;
  TxnCountReceivedDS = new MatTableDataSource<any>();

  readonly mockData = [
    {
      rank: 1,
      address: 'C541637EC458AE58564A491F25E5D5321312BD4B9E15A7922B0887AF7C0E0A8D',
      total: 1452458,
      percentage: 20
    },
    {
      rank: 2,
      address: 'C541637EC458AE58564A491F25E5D5321312BD4B9E15A7922B0887AF7C0E0A8D',
      total: 252458,
      percentage: 15.81
    },
    {
      rank: 3,
      address: 'C541637EC458AE58564A491F25E5D5321312BD4B9E15A7922B0887AF7C0E0A8D',
      total: 8456270,
      percentage: 45.11
    },
    {
      rank: 4,
      address: 'C541637EC458AE58564A491F25E5D5321312BD4B9E15A7922B0887AF7C0E0A8D',
      total: 5981200,
      percentage: 78.15
    },
    {
      rank: 5,
      address: 'C541637EC458AE58564A491F25E5D5321312BD4B9E15A7922B0887AF7C0E0A8D',
      total: 120152,
      percentage: 64.16
    },
    {
      rank: 6,
      address: 'C541637EC458AE58564A491F25E5D5321312BD4B9E15A7922B0887AF7C0E0A8D',
      total: 7598410,
      percentage: 48.91
    },
    {
      rank: 7,
      address: 'C541637EC458AE58564A491F25E5D5321312BD4B9E15A7922B0887AF7C0E0A8D',
      total: 7450315,
      percentage: 9.54
    },
    {
      rank: 8,
      address: 'C541637EC458AE58564A491F25E5D5321312BD4B9E15A7922B0887AF7C0E0A8D',
      total: 7845102,
      percentage: 26.47
    },
    {
      rank: 9,
      address: 'C541637EC458AE58564A491F25E5D5321312BD4B9E15A7922B0887AF7C0E0A8D',
      total: 7841026,
      percentage: 15.15
    },
    {
      rank: 10,
      address: 'C541637EC458AE58564A491F25E5D5321312BD4B9E15A7922B0887AF7C0E0A8D',
      total: 3564812,
      percentage: 82.12
    }
  ]

  constructor(
      public global: Globals
  ) {}

  ngOnInit(): void {
    this.getTransactionData(this.currentRange)
  }

  getTransactionData(time: string) {
    this.currentRange = time;
    // remove setTimeOut when call API
    setTimeout(() => {
      this.AURASendersDS.data = this.mockData;
      this.AURASendersLoading = false;
      this.AURAReceiversDS.data = this.mockData;
      this.AURAReceiversLoading = false;
      this.TxnCountSentDS.data = this.mockData;
      this.TxnCountSentLoading = false;
      this.TxnCountReceivedDS.data = this.mockData;
      this.TxnCountReceivedLoading = false;
    }, 500);
  }

}
