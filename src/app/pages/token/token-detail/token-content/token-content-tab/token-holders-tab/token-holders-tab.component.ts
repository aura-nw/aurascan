import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TableTemplate } from '../../../../../../core/models/common.model';
import { Globals } from '../../../../../../global/global';

@Component({
  selector: 'app-token-holders-tab',
  templateUrl: './token-holders-tab.component.html',
  styleUrls: ['./token-holders-tab.component.scss'],
})
export class TokenHoldersTabComponent implements OnInit, OnChanges {
  @Input() keyWord = '';
  loading = true;
  mockData = [
    {
      id: 1,
      name: 'Binance 7',
      amount: 4500000,
      percentage: 52.015,
      value: 3819141264.83,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 2,
      name: 'Binance 8',
      amount: 500000,
      percentage: 27.1419,
      value: 9141264.83,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 3,
      name: 'Binance 9',
      amount: 250000,
      percentage: 3.5523,
      value: 9341264.83,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 4,
      name: 'Binance 10',
      amount: 211336.9,
      percentage: 1.2747,
      value: 93592357.81,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 5,
      name: 'Binance 11',
      amount: 200000,
      percentage: 1.2063,
      value: 88571714.46,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 6,
      name: 'Binance 12',
      amount: 134445,
      percentage: 0.8109,
      value: 59540120.75,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 7,
      name: 'Binance 13',
      amount: 100000,
      percentage: 0.6032,
      value: 44285857.23,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 8,
      name: 'Binance 14',
      amount: 92169.99,
      percentage: 0.5559,
      value: 40818270.18,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 9,
      name: 'Binance 19',
      amount: 88029.62000609,
      percentage: 0.3318,
      value: 24361100.65,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 10,
      name: 'Binance 20',
      amount: 23528.169876785489362031,
      percentage: 0.1419,
      value: 10419651.72,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
  ];
  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'id' },
    { matColumnDef: 'name', headerCellDef: 'name' },
    { matColumnDef: 'amount', headerCellDef: 'amount' },
    { matColumnDef: 'percentage', headerCellDef: 'percentage' },
    { matColumnDef: 'value', headerCellDef: 'value' },
    { matColumnDef: 'hashCode', headerCellDef: 'hashCode' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  constructor(public global: Globals) {}

  ngOnInit(): void {
    this.getTokenData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.mockData) {
      const filterData = this.mockData.filter(
        (data) => data.name.includes(this.keyWord) || data.hashCode.includes(this.keyWord),
      );
      if (filterData.length > 0) {
        this.pageData = {
          length: filterData.length,
          pageSize: 10,
          pageIndex: 1,
        };
        this.dataSource = new MatTableDataSource<any>(filterData);
      }
    }
  }

  getTokenData() {
    this.pageData = {
      length: this.mockData.length,
      pageSize: 10,
      pageIndex: 1,
    };
    this.loading = true;
    this.dataSource = new MatTableDataSource<any>(this.mockData);
    this.loading = false;
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }
}
