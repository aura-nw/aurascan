import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { TokenService } from 'src/app/core/services/token.service';
import { Globals } from 'src/app/global/global';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';

@Component({
  selector: 'app-community-pool',
  templateUrl: './community-pool.component.html',
  styleUrls: ['./community-pool.component.scss'],
})
export class CommunityPoolComponent implements OnInit {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'name', headerCellDef: 'name' },
    { matColumnDef: 'symbol', headerCellDef: 'symbol' },
    { matColumnDef: 'denom', headerCellDef: 'denom' },
    { matColumnDef: 'amount', headerCellDef: 'amount' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  sortedData: any;
  sort: MatSort;
  filterSearchData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';
  listCoin = this.environmentService.configValue.coins;

  searchSubject = new Subject();
  destroy$ = new Subject();

  constructor(
    public translate: TranslateService,
    public global: Globals,
    public tokenService: TokenService,
    private environmentService: EnvironmentService,
  ) {}

  // ngOnDestroy(): void {
  //   // throw new Error('Method not implemented.');
  //   this.destroy$.next();
  //   this.destroy$.complete();
  // }

  ngOnInit(): void {
    this.getListToken();

    // this.searchSubject
    //   .asObservable()
    //   .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
    //   .subscribe(() => {
    //     if (this.pageData.pageIndex === PAGE_EVENT.PAGE_INDEX) {
    //       this.getListToken();
    //     } else {
    //       this.pageChange.selectPage(0);
    //     }
    //   });
  }

  onKeyUp() {
    // this.searchSubject.next(this.textSearch);
  }

  async getListToken() {
    const res = await this.tokenService.getListAssetCommunityPool();
    let listAssetLcd = _.get(res, 'data.pool');

    listAssetLcd.forEach((element) => {
      let test = this.listCoin.find((i) => i.denom === element.denom);
      console.log(test);
      if (test) {
        element.decimal = test.decimal;
        element.symbol = test.display;
        element.logo = test.logo;
        element.name = test.name;
      } else {
        element.decimal = 6;
        element.symbol = '';
        element.logo = '';
        element.name = '';
      }
    });
    this.dataSource = new MatTableDataSource<any>(listAssetLcd)
    this.pageData.length = listAssetLcd.length;

    // this.tokenService.getListToken(payload).subscribe((res: ResponseDto) => {
    //   res.data.forEach((data) => {
    //     Object.assign(data, {
    //       ...data,
    //       circulating_market_cap: +data.circulating_market_cap || 0,
    //       onChainMarketCap: +data.circulating_market_cap || 0,
    //       volume: +data.volume_24h,
    //       price: +data.price,
    //       isValueUp: data.price_change_percentage_24h < 0 ? false : true,
    //       change: Number(data.price_change_percentage_24h.toString()),
    //       isHolderUp: data.holders_change_percentage_24h < 0 ? false : true,
    //       holders: +data.holders,
    //       holderChange: Number(data.holders_change_percentage_24h.toString()),
    //     });
    //   });

    //   this.dataSource = new MatTableDataSource<any>(res.data);
    //   this.pageData.length = res.meta.count;
    // });
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  sortData(sort: Sort) {
    this.dataSource.data.forEach((data) => {
      data.circulating_market_cap = +data.circulating_market_cap;
      data.volume = +data.volume_24h;
      data.price = +data.price;
      data.holders = +data.holders;
    });

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
        case 'circulating_market_cap':
          return this.compare(a.circulating_market_cap, b.circulating_market_cap, isAsc);
        case 'onChainMarketCap':
          return this.compare(a.onChainMarketCap, b.onChainMarketCap, isAsc);
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
        .sort((a, b) => this.compare(a.change, b.change, !isAsc));
      this.sortedData = isAsc ? lstDown.concat(lstUp) : lstUp.concat(lstDown);
    }

    let dataFilter = this.sortedData;
    this.pageData = {
      length: this.pageData.length,
      pageSize: this.pageData.pageSize,
      pageIndex: this.pageData.pageIndex,
    };
    this.dataSource = new MatTableDataSource<any>(dataFilter);
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  resetSearch() {
    this.textSearch = '';
    // this.onKeyUp();
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListToken();
  }
}
