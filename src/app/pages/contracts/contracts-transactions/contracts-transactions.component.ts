import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/smart-contract.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { Globals } from 'src/app/global/global';
import { DropdownElement } from 'src/app/shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-contracts-transactions',
  templateUrl: './contracts-transactions.component.html',
  styleUrls: ['./contracts-transactions.component.scss'],
})
export class ContractsTransactionsComponent implements OnInit {
  // data table
  mockData: {
    txHash: string;
    method: string;
    block: number;
    time: Date;
    from: string;
    to: string;
    label: string;
    value: number;
    fee: number;
  }[] = [
    {
      txHash: 'DCE3D1C7FDCD2A620940DE97235A4D484C769486493B51ECC3E06BF0DBE9D5C8',
      method: 'Transfer',
      block: 2722076,
      time: moment().subtract(100, 's').toDate(),
      from: 'DCE3D1C7FDCD2A620940DE97235A4D484C769486493B51ECC3E06BF0DBE9D5C8',
      to: 'DCE3D1C7FDCD2A620940DE97235A4D484C769486493B51ECC3E06BF0DBE9D5C8',
      label: 'TO',
      value: 123.123,
      fee: 2.134,
    },
    {
      txHash: 'DCE3D1C7FDCD2A620940DE97235A4D484C769486493B51ECC3E06BF0DBE9D5C8',
      method: 'Transfer',
      block: 2722076,
      time: moment().subtract(100, 'm').toDate(),
      from: 'DCE3D1C7FDCD2A620940DE97235A4D484C769486493B51ECC3E06BF0DBE9D5C8',
      to: 'DCE3D1C7FDCD2A620940DE97235A4D484C769486493B51ECC3E06BF0DBE9D5C8',
      label: 'OUT',
      value: 123.123,
      fee: 2.134,
    },
  ];

  templates: Array<TableTemplate> = [
    { matColumnDef: 'txHash', headerCellDef: 'Txn Hash', type: 'hash-url' },
    { matColumnDef: 'method', headerCellDef: 'Method', type: 'status', headerWidth: 10 },
    { matColumnDef: 'block', headerCellDef: 'Blocks', type: 'hash-url', headerWidth: 8, isUrl: '/block' },
    { matColumnDef: 'time', headerCellDef: 'Time', type: 'time-distance', headerWidth: 10 },
    { matColumnDef: 'from', headerCellDef: 'From', type: 'hash-url', headerWidth: 15 },
    { matColumnDef: 'label', headerCellDef: '', type: 'status', headerWidth: 8, justify: 'center' },
    { matColumnDef: 'to', headerCellDef: 'To', type: 'hash-url', headerWidth: 15 },
    { matColumnDef: 'value', headerCellDef: 'Value', type: 'numb', suffix: 'Aura', headerWidth: 10 },
    { matColumnDef: 'fee', headerCellDef: 'Fee', type: 'numb', headerWidth: 10 },
  ];

  contractInfo = {
    contractsAddress: 'aura1gp7qcchk3y8emexal0r0s2txc94fkhnywslp2wnc3qcd8ng0wtys9aq24r',
    count: 21231231,
  };

  constructor(public translate: TranslateService, public global: Globals, private router: Router) {}

  ngOnInit(): void {}

  filterData(keyWord: string) {
    // keyWord = keyWord.toLowerCase();
    // this.filterSearchData = this.mockData.filter(
    //   (data) => data.method.toLowerCase().includes(keyWord) || data.fee.toLowerCase().includes(keyWord),
    // );
  }
}
