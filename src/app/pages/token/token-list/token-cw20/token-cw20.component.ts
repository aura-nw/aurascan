import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, mergeMap, repeat, takeLast, takeUntil } from 'rxjs/operators';
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

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  sortedData: any;
  sort: MatSort;
  filterSearchData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';
  isLoading = true;

  searchSubject = new Subject();
  destroy$ = new Subject<void>();
  dataTable = [];

  constructor(
    public translate: TranslateService,
    public global: Globals,
    public tokenService: TokenService,
    private environmentService: EnvironmentService,
    private datePipe: DatePipe,
  ) {}

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
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

  getAllCW20Token(): Observable<any> {
    let now = new Date();
    now.setDate(now.getDate() - 1);

    let payload = {
      offset: 0,
      date: this.datePipe.transform(now, DATEFORMAT.DATE_ONLY),
    };
    let cw20Total = [];
    const destroy_cw20$ = new Subject<void>();
    return of(null).pipe(
      mergeMap(() => {
        return this.tokenService.getListToken(payload);
      }),
      map((res) => {
        const count = _.get(res, `cw20_contract_aggregate`);
        const cw20Data = _.get(res, `cw20_contract`);
        // Get more data when response data less than total data
        if (cw20Total.length < count?.aggregate?.count) {
          cw20Total = [...cw20Total, ...cw20Data];
          payload = {
            offset: cw20Total.length,
            date: this.datePipe.transform(now, DATEFORMAT.DATE_ONLY),
          };
        } else {
          destroy_cw20$.next();
          destroy_cw20$.complete();
        }
        return cw20Total;
      }),
      repeat(),
      takeUntil(destroy_cw20$),
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
      // Get the frist time data init screen
      this.getAllCW20Token()
        .pipe(takeLast(1))
        .subscribe(
          (res) => {
            this.tokenService.getTokenMarketData().subscribe((tokenMarket) => {
              // Flat data for mapping response api
              const dataFlat = res?.map((item) => {
                let changePercent = 0;
                const tokenFind = tokenMarket?.find(
                  (f) => String(f.contract_address) === item?.smart_contract?.address,
                );
                if (item.cw20_total_holder_stats?.length > 1) {
                  changePercent =
                    (item.cw20_total_holder_stats[1].total_holder * 100) /
                      item.cw20_total_holder_stats[0].total_holder -
                    100;
                }
                return {
                  coin_id: tokenFind?.coin_id || '',
                  contract_address: item.smart_contract.address || '',
                  name: item.name || '',
                  symbol: item.symbol || '',
                  image: item.marketing_info?.logo?.url ? item.marketing_info?.logo?.url : tokenFind?.image || '',
                  description: tokenFind?.description || '',
                  verify_status: tokenFind?.verify_status || '',
                  verify_text: tokenFind?.verify_text || '',
                  circulating_market_cap: +tokenFind?.circulating_market_cap || 0,
                  onChainMarketCap: +tokenFind?.circulating_market_cap || 0,
                  volume: +tokenFind?.total_volume || 0,
                  price: +tokenFind?.current_price || 0,
                  isHolderUp: changePercent >= 0 ? true : false,
                  isValueUp: tokenFind?.price_change_percentage_24h >= 0 ? true : false,
                  change: tokenFind?.price_change_percentage_24h || 0,
                  holderChange: Math.abs(changePercent),
                  holders: item.cw20_holders_aggregate?.aggregate?.count || 0,
                  max_total_supply: tokenFind?.max_supply || 0,
                  fully_diluted_market_cap: tokenFind?.fully_diluted_valuation || 0,
                };
              });
              // store datatable
              this.dataTable = dataFlat;
              // Sort and slice 20 frist record.
              const result = dataFlat
                ?.sort((a, b) => b.circulating_market_cap - a.circulating_market_cap)
                .slice(payload?.offset, payload?.offset + payload?.limit);
              this.dataSource = new MatTableDataSource<any>(result);
              this.pageData.length = res?.length;
            });
          },
          (e) => {},
          () => {
            this.isLoading = false;
          },
        );
    }
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
