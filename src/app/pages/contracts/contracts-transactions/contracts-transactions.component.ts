import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/smart-contract.constant';
import { IResponsesTemplates, TableTemplate } from 'src/app/core/models/common.model';
import { IContractsResponse } from 'src/app/core/models/contract.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { Globals } from 'src/app/global/global';
import { DropdownElement } from 'src/app/shared/components/dropdown/dropdown.component';
import { TableData } from 'src/app/shared/components/table/table.component';

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

  contract$ = this.activeRouter.params.pipe(
    mergeMap((e) => {
      if (e?.addressId) {
        this.contractInfo.contractsAddress = e?.addressId;
        return this.contractService.getTransactions(e.addressId);
      }
      this.router.navigate(['']);
      return of(null);
    }),
    map((dta: IResponsesTemplates<IContractsResponse[]>) => {
      if (dta?.data) {
        this.contractInfo.count = dta.meta?.count || 0;

        const ret = dta.data.map((contract) => {
          const method = Object.keys(contract.messages[0].msg)[0];

          const value: TableData = {
            txHash: contract.tx_hash,
            method,
            block: contract.blockId,
            time: new Date(contract.timestamp),
            from: contract.messages[0].sender,
            label: '',
            to: '',
            value: 0,
            fee: +contract.fee,
          };

          return value;
        });

        return ret;
      }

      this.router.navigate(['']);

      return null;
    }),
  );

  constructor(
    public translate: TranslateService,
    private router: Router,
    private contractService: ContractService,
    private activeRouter: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.contract$.subscribe();
  }

  filterData(keyWord: string) {
    // keyWord = keyWord.toLowerCase();
    // this.filterSearchData = this.mockData.filter(
    //   (data) => data.method.toLowerCase().includes(keyWord) || data.fee.toLowerCase().includes(keyWord),
    // );
  }
}
