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
  elements: DropdownElement[] = [
    {
      image: 'assets/icons/icons-svg/white/arrow-right-2.svg',
      label: 'View OutGoing Txns',
      key: 0,
    },
    {
      image: 'assets/icons/icons-svg/white/arrow-left-2.svg',
      label: 'View Ingoing Txns',
      key: 1,
    },
    {
      image: 'assets/icons/icons-svg/white/contract.svg',
      label: 'View Contract Creation',
      key: 2,
    },
  ];
  textSearch = '';
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
      block: 2341234,
      time: moment().subtract(100, 's').toDate(),
      from: 'DCE3D1C7FDCD2A620940DE97235A4D484C769486493B51ECC3E06BF0DBE9D5C8',
      to: 'DCE3D1C7FDCD2A620940DE97235A4D484C769486493B51ECC3E06BF0DBE9D5C8',
      label: 'TO',
      value: 4573079,
      fee: 4573079,
    },
  ];
  templates: Array<TableTemplate> = [
    { matColumnDef: 'txHash', headerCellDef: 'txHash' },
    { matColumnDef: 'method', headerCellDef: 'method' },
    { matColumnDef: 'block', headerCellDef: 'block' },
    { matColumnDef: 'time', headerCellDef: 'time' },
    { matColumnDef: 'from', headerCellDef: 'from' },
    { matColumnDef: 'label', headerCellDef: 'label' },
    { matColumnDef: 'to', headerCellDef: 'to' },
    { matColumnDef: 'value', headerCellDef: 'value' },
    { matColumnDef: 'fee', headerCellDef: 'fee' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  sortedData: any;
  sort: MatSort;
  filterSearchData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;

  contractInfo = {
    contractsAddress: 'aura1gp7qcchk3y8emexal0r0s2txc94fkhnywslp2wnc3qcd8ng0wtys9aq24r',
    count: 21231231,
  };

  constructor(public translate: TranslateService, public global: Globals, private router: Router) {}

  ngOnInit(): void {
    this.getTokenData();
  }

  filterData(keyWord: string) {
    // keyWord = keyWord.toLowerCase();
    // this.filterSearchData = this.mockData.filter(
    //   (data) => data.method.toLowerCase().includes(keyWord) || data.fee.toLowerCase().includes(keyWord),
    // );
  }

  getTokenData() {
    this.pageData = {
      length: this.mockData.length,
      pageSize: PAGE_EVENT.PAGE_SIZE,
      pageIndex: PAGE_EVENT.PAGE_INDEX,
    };

    // this.mockData.forEach((data) => {
    //   data['isValueUp'] = true;
    //   if (data.change < 0) {
    //     data['isValueUp'] = false;
    //     data.change = Number(data.change.toString().substring(1));
    //   }
    // });
    let data = this.mockData.slice();

    // this.sortedData = data.sort((a, b) => {
    //   return this.compare(a.circulatingMarketCap, b.circulatingMarketCap, false);
    // });

    // this.mockData = this.sortedData;
    this.dataSource = new MatTableDataSource<any>(this.mockData);
  }

  searchToken(): void {
    this.filterSearchData = null;
    if (this.textSearch.length > 0) {
      this.filterData(this.textSearch);
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  sortData(sort: Sort) {
    // let data = this.mockData.slice();
    // if (!sort.active || sort.direction === '') {
    //   this.sortedData = data;
    //   return;
    // }

    // this.sortedData = data.sort((a, b) => {
    //   const isAsc = sort.direction === 'asc';
    //   switch (sort.active) {
    //     case 'price':
    //       return this.compare(a.price, b.price, false);
    //     case 'volume':
    //       return this.compare(a.volume, b.volume, false);
    //     case 'circulatingMarketCap':
    //       return this.compare(a.circulatingMarketCap, b.circulatingMarketCap, true);
    //     default:
    //       return 0;
    //   }
    // });

    // if (sort.active === 'change') {
    //   let lstUp = this.sortedData
    //     .filter((data) => data.isValueUp)
    //     ?.sort((a, b) => this.compare(a.change, b.change, false));
    //   let lstDown = this.sortedData
    //     .filter((data) => !data.isValueUp)
    //     .sort((a, b) => this.compare(a.change, b.change, true));
    //   this.sortedData = lstUp.concat(lstDown);
    // }

    // let dataFilter = this.sortedData;
    // this.pageData = {
    //   length: dataFilter.length,
    //   pageSize: PAGE_EVENT.PAGE_SIZE,
    //   pageIndex: PAGE_EVENT.PAGE_INDEX,
    // };
    // this.dataSource = new MatTableDataSource<any>(dataFilter);
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  handleLink(): void {
    this.router.navigate(['/token/token', this.filterSearchData[0]?.hashCode]);
  }

  viewSelected(e: DropdownElement): void {}
}
