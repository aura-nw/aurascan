import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';
import { PAGE_EVENT } from '../../../../core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from '../../../../core/constants/token.constant';
import { ResponseDto, TableTemplate } from '../../../../core/models/common.model';
import { Globals } from '../../../../global/global';

@Component({
  selector: 'app-token-cw20',
  templateUrl: './token-cw20.component.html',
  styleUrls: ['./token-cw20.component.scss'],
})
export class TokenCw20Component implements OnInit {
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'id' },
    { matColumnDef: 'token', headerCellDef: 'name' },
    { matColumnDef: 'price', headerCellDef: 'price' },
    { matColumnDef: 'change', headerCellDef: 'change' },
    { matColumnDef: 'volume', headerCellDef: 'volume' },
    { matColumnDef: 'circulatingMarketCap', headerCellDef: 'circulatingMarketCap' },
    { matColumnDef: 'onChainMarketCap', headerCellDef: 'onChainMarketCap' },
    { matColumnDef: 'holders', headerCellDef: 'holders' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataSourceBk: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  sortedData: any;
  sort: MatSort;
  filterSearchData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  dataSearch: any;
  enterSearch = '';

  image_s3 = this.environmentService.configValue.image_s3;
  defaultImage = this.image_s3 + 'images/icons/token-logo.png';

  constructor(
    public translate: TranslateService,
    public global: Globals,
    public tokenService: TokenService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.getListToken();
  }

  getListToken() {
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      keyword: '',
    };
    this.tokenService.getListToken(payload).subscribe((res: ResponseDto) => {
      res.data.forEach((data) => {
        data['isValueUp'] = true;
        if (data.change < 0) {
          data['isValueUp'] = false;
          data.change = Number(data.change.toString().substring(1));
        }
      });

      this.dataSource = new MatTableDataSource<any>(res.data);
      this.dataSourceBk = this.dataSource;
      this.pageData.length = res.meta.count;
    });
  }

  searchToken(): void {
    if (this.textSearch?.length > 0) {
      const payload = {
        limit: this.pageData.pageSize,
        offset: 0,
        keyword: this.textSearch,
      };

      this.tokenService.getListToken(payload).subscribe((res: ResponseDto) => {
        if (res?.data?.length > 0) {
          this.dataSearch = res.data;
        }

        let keyWord = this.textSearch.toLowerCase();
        this.filterSearchData = this.dataSearch?.filter(
          (data) => data.name.toLowerCase().includes(keyWord) || data.contract_address.toLowerCase().includes(keyWord),
        );
      });
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  sortData(sort: Sort) {
    let data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    const isAsc = sort.direction === 'asc';
    this.sortedData = data.sort((a, b) => {
      switch (sort.active) {
        case 'price':
          return this.compare(a.price, b.price, isAsc);
        case 'volume':
          return this.compare(a.volume, b.volume, isAsc);
        case 'circulatingMarketCap':
          return this.compare(a.circulatingMarketCap, b.circulatingMarketCap, isAsc);
        default:
          return 0;
      }
    });

    if (sort.active === 'change') {
      let lstUp = this.sortedData
        .filter((data) => data.isValueUp)
        ?.sort((a, b) => this.compare(a.change, b.change, isAsc));
      let lstDown = this.sortedData
        .filter((data) => !data.isValueUp)
        .sort((a, b) => this.compare(a.change, b.change, isAsc));
      this.sortedData = lstUp.concat(lstDown);
    }

    let dataFilter = this.sortedData;
    this.pageData = {
      length: dataFilter.length,
      pageSize: this.pageData.pageSize,
      pageIndex: PAGE_EVENT.PAGE_INDEX,
    };
    this.dataSource = new MatTableDataSource<any>(dataFilter);
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  setPageList(): void {
    if (this.filterSearchData?.length > 0) {
      this.enterSearch = this.textSearch;
      this.dataSource = new MatTableDataSource<any>(this.filterSearchData);
      this.pageData.length = this.filterSearchData?.length || 0;
    }
  }

  resetSearch() {
    this.textSearch = '';
    this.enterSearch = '';
    this.dataSource = this.dataSourceBk;
    this.pageData.length = this.dataSource?.data?.length || 0;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListToken();
  }
}
