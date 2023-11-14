import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatSort, Sort } from '@angular/material/sort';
import * as _ from 'lodash';
import { EMPTY, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, expand, map, reduce, switchMap, takeUntil } from 'rxjs/operators';
import { CoingeckoService } from 'src/app/core/data-services/coingecko.service';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { DATEFORMAT, PAGE_EVENT } from '../../../../core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from '../../../../core/constants/token.constant';
import { TableTemplate } from '../../../../core/models/common.model';
import { Globals } from '../../../../global/global';

@Component({
  selector: 'app-token-cw20',
  templateUrl: './token-cw20.component.html',
  styleUrls: ['./token-cw20.component.scss'],
})
export class TokenCw20Component implements OnInit, OnDestroy {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'id' },
    { matColumnDef: 'token', headerCellDef: 'name' },
    { matColumnDef: 'price', headerCellDef: 'price' },
    { matColumnDef: 'change', headerCellDef: 'change' },
    { matColumnDef: 'volume', headerCellDef: 'volume' },
    { matColumnDef: 'circulating_market_cap', headerCellDef: 'circulatingMarketCap' },
    { matColumnDef: 'onChainMarketCap', headerCellDef: 'onChainMarketCap' },
    { matColumnDef: 'holders', headerCellDef: 'holders' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  errTxt: string;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  sortedData: any;
  sort: MatSort;
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  image_s3 = this.environmentService.imageUrl;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';
  isLoading = true;

  searchSubject = new Subject();
  destroy$ = new Subject<void>();
  dataTable = [];

  constructor(
    public global: Globals,
    public tokenService: TokenService,
    private environmentService: EnvironmentService,
    private datePipe: DatePipe,
    private coingecko: CoingeckoService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.getListToken();
    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.pageData.pageIndex === PAGE_EVENT.PAGE_INDEX) {
          this.getListToken();
        } else {
          this.pageChange.selectPage(0);
        }
      });
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  getCw20Tokens() {
    let now = new Date();
    now.setDate(now.getDate() - 1);

    let payload = {
      offset: 0,
      date: this.datePipe.transform(now, DATEFORMAT.DATE_ONLY),
    };

    return this.tokenService.getListToken(payload).pipe(
      expand((data, index) => {
        const count = _.get(data, `cw20_contract_aggregate.aggregate.count`);

        // get all data
        if (index + 1 > count / 100) {
          return EMPTY;
        }

        return this.tokenService.getListToken({
          ...payload,
          offset: (index + 1) * 100,
        });
      }),
      reduce((acc, value) => {
        const cw20Data = _.get(value, `cw20_contract`);
        return [...acc, ...cw20Data];
      }, []),
    );
  }

  getListToken() {
    this.textSearch = this.textSearch?.trim();
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
    };
    // Check table exist for search and pagination
    if (this.dataTable.length > 0) {
      let result = this.dataTable
        ?.sort((a, b) => b.circulating_market_cap - a.circulating_market_cap)
        .slice(payload?.offset, payload?.offset + payload?.limit);
      // Search with text search
      if (this.textSearch) {
        result = this.dataTable
          .filter(
            (item) =>
              item.name.toLowerCase().includes(this.textSearch.toLowerCase()) ||
              item.contract_address == this.textSearch.toLowerCase(),
          )
          ?.sort((a, b) => b.circulating_market_cap - a.circulating_market_cap);

        const data = result.slice(payload?.offset, payload?.offset + payload?.limit);
        this.dataSource = new MatTableDataSource<any>(data);
        this.pageData.length = result?.length;
      } else {
        this.dataSource = new MatTableDataSource<any>(result);
        this.pageData.length = this.dataTable?.length;
      }
    } else {
      this.getCw20Tokens()
        .pipe(
          switchMap((res) => {
            return this.coingecko.coinsMarket$.pipe(
              map((tokenMarket) => {
                return this.mappingCw20TokensAndPrice(res, tokenMarket);
              }),
            );
          }),
        )
        .subscribe({
          next: (dataFlat) => {
            // store datatable
            this.dataTable = dataFlat;
            // Sort and slice 20 frist record.
            const result = dataFlat
              ?.sort((a, b) => b.circulating_market_cap - a.circulating_market_cap)
              .slice(payload?.offset, payload?.offset + payload?.limit);

            this.dataSource = new MatTableDataSource<any>(result);
            this.pageData.length = dataFlat?.length;

            this.isLoading = false;
          },
          error: (e) => {
            this.isLoading = false;
            this.errTxt = `${e.status} ${e.statusText}`;
          },
        });
    }
  }

  mappingCw20TokensAndPrice(cw20Tokens: any[], coinsMarket: any[]) {
    return cw20Tokens.map((item) => {
      let changePercent = 0;
      const tokenFound = coinsMarket?.find((f) => String(f.contract_address) === item?.smart_contract?.address);

      if (item.cw20_total_holder_stats?.length > 1) {
        changePercent =
          (item.cw20_total_holder_stats[1].total_holder * 100) / item.cw20_total_holder_stats[0].total_holder - 100;
      }

      return {
        coin_id: tokenFound?.coin_id || '',
        contract_address: item.smart_contract.address || '',
        name: item.name || '',
        symbol: item.symbol || '',
        image: item.marketing_info?.logo?.url ? item.marketing_info?.logo?.url : tokenFound?.image || '',
        description: tokenFound?.description || '',
        verify_status: tokenFound?.verify_status || '',
        verify_text: tokenFound?.verify_text || '',
        circulating_market_cap: +tokenFound?.circulating_market_cap || 0,
        onChainMarketCap: +tokenFound?.circulating_market_cap || 0,
        volume: +tokenFound?.total_volume || 0,
        price: +tokenFound?.current_price || 0,
        isHolderUp: changePercent >= 0 ? true : false,
        isValueUp: tokenFound?.price_change_percentage_24h >= 0 ? true : false,
        change: tokenFound?.price_change_percentage_24h || 0,
        holderChange: Math.abs(changePercent),
        holders: item.cw20_holders_aggregate?.aggregate?.count || 0,
        max_total_supply: tokenFound?.max_supply || 0,
        fully_diluted_market_cap: tokenFound?.fully_diluted_valuation || 0,
      };
    });
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  sortData(sort: Sort) {
    this.dataSource.data.forEach((data) => {
      data.circulating_market_cap = +data.circulating_market_cap;
      data.volume = +data.volume;
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
    this.onKeyUp();
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListToken();
  }
}
