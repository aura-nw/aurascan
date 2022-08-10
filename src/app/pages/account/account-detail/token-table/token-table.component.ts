import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-token-table',
  templateUrl: './token-table.component.html',
  styleUrls: ['./token-table.component.scss'],
})
export class TokenTableComponent implements OnInit {
  @Input() assetCW20: any[];
  math = Math;
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'asset', headerCellDef: 'asset' },
    { matColumnDef: 'symbol', headerCellDef: 'symbol' },
    { matColumnDef: 'contractAddress', headerCellDef: 'contractAddress' },
    { matColumnDef: 'amount', headerCellDef: 'amount' },
    { matColumnDef: 'price', headerCellDef: 'price' },
    { matColumnDef: 'chance', headerCellDef: 'chance' },
    { matColumnDef: 'value', headerCellDef: 'value' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  sortedData: any;
  sort: MatSort;
  filterSearchData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;

  mockData = [
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '1622',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: 0.074,
      value: '4.12 ',
      valueByToken: '1.2',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162.2182',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: -0.02,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '12772.282',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: -0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '16.213',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: 0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162772.21382',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: 0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162772.21382',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: -0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162772.21382',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: 0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162772.21382',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: 0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162772.21382',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: -0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162772.21382',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: -0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162772.21382',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: -0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162772.21382',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: 0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162772.21382',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: -0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162772.21382',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: 0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162772.21382',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: -0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162772.21382',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: 0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162772.21382',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: 0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162772.21382',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: 0.01,
      value: '4.12 ',
      valueByToken: '0.001',
    },
    {
      asset: 'Aura',
      imgUrl: 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/images/icons/token-logo.png',
      symbol: 'AURA',
      contractAddress: 'aura1s3qzh4c7ljgmk9j5a0nn773gjar83h75kw60llunsmsdarj3amgscmmaru',
      amount: '162772.21382',
      price: '21.199',
      priceByToken: ' 0.0054',
      chance: -0.01,
      value: '4.12 ',
      valueByToken: '0.14',
    },
  ];

  constructor(public global: Globals) {}

  ngOnInit(): void {
    this.getListToken();
  }

  getListToken() {
    const payload = {
      limit: this.pageData.pageSize,
      offset: 0,
      keyword: '',
    };
    this.dataSource = new MatTableDataSource<any>(this.mockData);
    this.pageData.length = this.mockData.length;
  }

  sortData(sort: Sort) {}
  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }
  handlePageEvent(e: any) {
    this.pageData = e;
  }
  searchToken(): void {
    this.filterSearchData = null;
    if (this.textSearch.length > 0) {
      const payload = {
        limit: this.pageData.pageSize,
        offset: 0,
        keyword: this.textSearch,
      };

      let keyWord = this.textSearch.toLowerCase();
      this.filterSearchData = this.mockData.filter(
        (data) => data.contractAddress.toLowerCase().includes(keyWord) || data.symbol.toLowerCase().includes(keyWord),
      );
    }
  }
}
