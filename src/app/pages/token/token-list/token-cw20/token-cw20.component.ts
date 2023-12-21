import {DatePipe} from '@angular/common';
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LegacyPageEvent as PageEvent} from '@angular/material/legacy-paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {TranslateService} from '@ngx-translate/core';
import * as _ from 'lodash';
import {Observable, of, Subject} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  repeat,
  take,
  takeLast,
  takeUntil,
} from 'rxjs/operators';
import {EnvironmentService} from 'src/app/core/data-services/environment.service';
import {TokenService} from 'src/app/core/services/token.service';
import {PaginatorComponent} from 'src/app/shared/components/paginator/paginator.component';
import {DATEFORMAT, PAGE_EVENT, STORAGE_KEYS, TIMEOUT_ERROR, TOKEN_ID_GET_PRICE} from '../../../../core/constants/common.constant';
import {MAX_LENGTH_SEARCH_TOKEN, TokenType} from '../../../../core/constants/token.constant';
import {TableTemplate} from '../../../../core/models/common.model';
import {Globals} from '../../../../global/global';
import {ContractRegisterType} from 'src/app/core/constants/contract.enum';
import local from "src/app/core/utils/storage/local";
import {balanceOf, getBalance} from "src/app/core/utils/common/parsing";
import BigNumber from "bignumber.js";

@Component({
  selector: 'app-token-cw20',
  templateUrl: './token-cw20.component.html',
  styleUrls: ['./token-cw20.component.scss'],
})
export class TokenCw20Component implements OnInit, OnDestroy {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  textSearch = '';
  templates: Array<TableTemplate> = [
    {matColumnDef: 'id', headerCellDef: 'id'},
    {matColumnDef: 'token', headerCellDef: 'name'},
    {matColumnDef: 'type', headerCellDef: 'type'},
    {matColumnDef: 'price', headerCellDef: 'price'},
    {matColumnDef: 'circulating_market_cap', headerCellDef: 'circulatingMarketCap'},
    {matColumnDef: 'onChainMarketCap', headerCellDef: 'onChainMarketCap'},
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
  filterType = [];
  tokenType = TokenType;
  searchSubject = new Subject();
  destroy$ = new Subject<void>();
  dataTable = [];
  listTokenIBC;
  nativeToken;

  constructor(
    public translate: TranslateService,
    public global: Globals,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    private datePipe: DatePipe,
  ) {
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.getTokenData();
    this.getPriceBTC();
    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.pageData.pageIndex === PAGE_EVENT.PAGE_INDEX) {
          this.getTokenData();
        } else {
          this.pageChange.selectPage(0);
        }
      });

    this.nativeToken = [{
      "created_at": "2023-09-14T03:36:41.199Z",
      "updated_at": "2023-12-18T08:36:11.425Z",
      "id": 1420,
      "contract_address": null,
      "coin_id": "_",
      "symbol": "AURA",
      "name": "Aura Native",
      "image": "https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/token/download.png",
      "max_supply": "0.000000",
      "current_price": "0.000000",
      "price_change_percentage_24h": 0,
      "total_volume": "0.000000",
      "circulating_supply": "0.000000",
      "circulating_market_cap": "0.000000",
      "description": null,
      "market_cap": "0.000000",
      "fully_diluted_valuation": "0.000000",
      "verify_status": null,
      "verify_text": null,
      "denom": "utaura",
      "decimal": 6,
      "chain_id": null,
      "display": "AURA",
      "total_supply": 5.1
    }]
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  async getListTokenIBC() {
    this.listTokenIBC = local.getItem(STORAGE_KEYS.LIST_TOKEN_IBC);
    const res = await this.tokenService.getTokenSupply();
    const supply = _.get(res, 'data.supply');
    this.listTokenIBC.forEach(token => {
      supply.forEach(s => {
        if (token.denom === s.denom) {
          token.total_supply = balanceOf(Number(s?.amount) || 0, +token.decimal) || 0
        }
      })
    })
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

  searchData() {
    this.textSearch = this.textSearch?.trim();
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
    };
    let result = this.dataTable
      ?.sort((a, b) => this.compare(a.total_supply, b.total_supply, true))
      .slice(payload?.offset, payload?.offset + payload?.limit);
    // Search with text search
    if (this.textSearch) {
      result = this.dataTable
        .filter(
          (item) =>
            item.name.toLowerCase().includes(this.textSearch.toLowerCase()) ||
            item.contract_address == this.textSearch.toLowerCase(),
        )
        ?.sort((a, b) => this.compare(a.total_supply, b.total_supply, true));

      this.dataSource.data = result.slice(payload?.offset, payload?.offset + payload?.limit);
      this.pageData.length = result?.length;
    } else {
      this.dataSource.data = result;
      this.pageData.length = this.dataTable?.length;
    }
  }

  getListToken() {
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
    };
    // Get the first time data init screen
    this.getListTokenIBC().then(r => {
        this.getAllCW20Token()
          .pipe(takeLast(1))
          .subscribe({
            next: (res) => {
              this.tokenService.tokensMarket$
                .pipe(
                  filter((data) => _.isArray(data)),
                  take(1),
                )
                .subscribe({
                  next: (tokenMarket) => {
                    // Flat data for mapping response api
                    const mappedData = res?.map((item) => {
                      const foundToken = tokenMarket?.find((f) => f.contract_address === item?.smart_contract?.address);
                      const cw20_total_holder_stats = item.cw20_total_holder_stats;
                      let changePercent = 0;
                      if (cw20_total_holder_stats?.length > 1) {
                        changePercent =
                          (cw20_total_holder_stats[1].total_holder * 100) / cw20_total_holder_stats[0].total_holder - 100;
                      }

                      return {
                        coin_id: foundToken?.coin_id || '',
                        contract_address: item.smart_contract.address || '',
                        name: foundToken?.name || item.name || '',
                        symbol: foundToken?.symbol || item.symbol || '',
                        image: foundToken?.image || item.marketing_info?.logo?.url || '',
                        holders: item.cw20_holders_aggregate?.aggregate?.count || 0,
                        isHolderUp: changePercent >= 0,
                        holderChange: Math.abs(changePercent),
                        description: foundToken?.description || item.marketing_info?.description || '',
                        verify_status: foundToken?.verify_status || '',
                        verify_text: foundToken?.verify_text || '',
                        circulating_market_cap: +foundToken?.circulating_market_cap || 0,
                        onChainMarketCap: +foundToken?.circulating_market_cap || 0,
                        volume: +foundToken?.total_volume || 0,
                        price: +foundToken?.current_price || 0,
                        isValueUp:
                          foundToken?.price_change_percentage_24h && foundToken?.price_change_percentage_24h >= 0,
                        change: foundToken?.price_change_percentage_24h || 0,
                        max_total_supply: foundToken?.max_supply || 0,
                        fully_diluted_market_cap: foundToken?.fully_diluted_valuation || 0,
                        total_supply: getBalance(item.total_supply, item.decimal),
                      };
                    });
                    // store datatable
                    let dataList = []
                    if (this.filterType.includes(this.tokenType.IBC)) {
                      dataList.push(...this.listTokenIBC);
                    }
                    if (this.filterType.includes(this.tokenType.NATIVE)) {
                      dataList.push(...this.nativeToken);
                    }
                    if (this.filterType.includes(this.tokenType.CW20)) {
                      dataList.push(...mappedData);
                    }
                    if (this.filterType.length === 0) {
                      dataList.push(...this.listTokenIBC);
                      dataList.push(...this.nativeToken);
                      dataList.push(...mappedData);
                    }
                    this.dataTable = dataList;
                    // Sort and slice 20 frist record.
                    this.dataSource.data = dataList
                      ?.sort((a, b) => this.compare(a.total_supply, b.total_supply, true))
                      .sort((a, b) => (a.verify_status === b.verify_status ? 0 : a.verify_status ? -1 : 1))
                      .slice(payload?.offset, payload?.offset + payload?.limit);
                    this.pageData.length = res?.length;
                    this.isLoading = false;
                  },
                  error: (e) => {
                    if (e.name === TIMEOUT_ERROR) {
                      this.errTxt = e.message;
                    } else {
                      this.errTxt = e.error.error.statusCode + ' ' + e.error.error.message;
                    }
                    this.isLoading = false;
                  },
                });
            },
            error: (e) => {
              if (e.name === TIMEOUT_ERROR) {
                this.errTxt = e.message;
              } else {
                this.errTxt = e.error.error.statusCode + ' ' + e.error.error.message;
              }
              this.isLoading = false;
            },
          });
      }
    );
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  sortData(sort: Sort) {
    this.pageChange.selectPage(0);
    this.dataSource.data.forEach((data) => {
      data.circulating_market_cap = +data.circulating_market_cap;
      data.volume = +data.volume;
      data.price = +data.price;
      data.holders = +data.holders;
    });
    let data = this.dataTable;
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
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
    };

    let dataFilter = this.sortedData.slice(payload?.offset, payload?.offset + payload?.limit);
    this.pageData = {
      length: this.pageData.length,
      pageSize: this.pageData.pageSize,
      pageIndex: this.pageData.pageIndex,
    };
    this.dataSource.data = dataFilter;
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (BigNumber(a).lt(b) ? -1 : 1) * (isAsc ? 1 : -1);
  }

  resetSearch() {
    this.textSearch = '';
    this.onKeyUp();
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
    };
    if (this.textSearch) {
      this.getTokenData();
    } else {
      if (this.sortedData) {
        this.dataSource.data = this.sortedData.slice(payload?.offset, payload?.offset + payload?.limit);
      } else {
        this.dataSource.data = this.dataTable
          ?.sort((a, b) => b.circulating_market_cap - a.circulating_market_cap)
          .sort((a, b) => (a.verify_status === b.verify_status ? 0 : a.verify_status ? -1 : 1))
          .slice(payload?.offset, payload?.offset + payload?.limit);
      }
    }
  }

  getPriceBTC() {
    this.tokenService.getPriceToken(TOKEN_ID_GET_PRICE.BTC).subscribe((res) => {
      this.global.price.btc = res.data || 0;
    });
  }

  getTokenData(val?: string) {
    if (val) {
      if (this.filterType.includes(val)) {
        this.filterType = this.filterType.filter(item => item !== val)
      } else {
        this.filterType.push(val);
      }
    } else {
      this.filterType = [];
    }
    this.getListToken();
    console.log(this.filterType)
  }
}
