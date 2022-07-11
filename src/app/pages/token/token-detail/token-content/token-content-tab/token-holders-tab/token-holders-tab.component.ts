import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
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
      address: 'Curve.fi: BUSD v2',
      quantity: 4500000,
      percentage: 52.015,
      value: 3819141264.83,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 2,
      address: 'aurae77482e45F1F44dE...',
      quantity: 500000,
      percentage: 27.1419,
      value: 9141264.83,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 3,
      address: 'aurag49482e45F1F472F...',
      quantity: 250000,
      percentage: 3.5523,
      value: 9341264.83,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 4,
      address: 'FTX Exchange',
      quantity: 211336.9,
      percentage: 81.2747,
      value: 93592357.81,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 5,
      address: 'Binance 12',
      quantity: 200000,
      percentage: 17.2063,
      value: 88571714.46,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 6,
      address: 'Harmony: BUSD Bridge',
      quantity: 134445,
      percentage: 0.8109,
      value: 59540120.75,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 7,
      address: 'Curve fi: BUSD v2',
      quantity: 100000,
      percentage: 30.6032,
      value: 44285857.23,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 8,
      address: 'aurae77482e45F1F44dE...',
      quantity: 92169.99,
      percentage: 10.5559,
      value: 40818270.18,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 9,
      address: 'aurag49482e45F1F472F...',
      quantity: 88029.62000609,
      percentage: 0.3318,
      value: 24361100.65,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
    {
      id: 10,
      address: 'Binance 20',
      quantity: 23528.169876785489362031,
      percentage: 43.1419,
      value: 10419651.72,
      hashCode: '0xb4b3351918a9bedc7d386c6a685c42e69920b34d',
    },
  ];
  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'id' },
    { matColumnDef: 'address', headerCellDef: 'address' },
    { matColumnDef: 'quantity', headerCellDef: 'quantity' },
    { matColumnDef: 'percentage', headerCellDef: 'percentage' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  constructor(public global: Globals) {}

  ngOnInit(): void {
    this.getTokenData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.mockData) {
      const filterData = this.mockData.filter(
        (data) => data.address.includes(this.keyWord) || data.hashCode.includes(this.keyWord),
      );
      if (filterData.length > 0) {
        this.pageData.length = filterData.length;
        this.dataSource = new MatTableDataSource<any>(filterData);
      }
    }
  }

  getTokenData() {
    this.pageData.length = this.mockData.length;
    this.loading = true;
    this.dataSource = new MatTableDataSource<any>(this.mockData);
    this.loading = false;
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }
}
