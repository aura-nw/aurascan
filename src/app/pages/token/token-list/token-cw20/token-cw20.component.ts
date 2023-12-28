import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import { Observable, Subject, of } from 'rxjs';
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
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { IBCService } from 'src/app/core/services/ibc.service';
import { TokenService } from 'src/app/core/services/token.service';
import { balanceOf, getBalance } from 'src/app/core/utils/common/parsing';
import local from 'src/app/core/utils/storage/local';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { DATEFORMAT, PAGE_EVENT, STORAGE_KEYS, TIMEOUT_ERROR } from '../../../../core/constants/common.constant';
import { ETokenCoinType, MAX_LENGTH_SEARCH_TOKEN } from '../../../../core/constants/token.constant';
import { TableTemplate } from '../../../../core/models/common.model';

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
    { matColumnDef: 'type', headerCellDef: 'type' },
    { matColumnDef: 'price', headerCellDef: 'price' },
    { matColumnDef: 'totalSupply', headerCellDef: 'In-Chain Supply Amount' },
    { matColumnDef: 'inChainValue', headerCellDef: 'In-Chain Supply' },
    { matColumnDef: 'holder', headerCellDef: 'Holder' },
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
  chainInfo = this.environmentService.chainInfo.currencies[0];
  chainName = this.environmentService.chainInfo.chainName;
  image_s3 = this.environmentService.imageUrl;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';
  isLoadingTable = true;
  filterType = [];
  ETokenCoinType = ETokenCoinType;
  searchSubject = new Subject();
  destroy$ = new Subject<void>();
  dataTable = [];
  listTokenIBC: any;
  nativeToken: any;
  isMobileMatched = false;
  dataSourceMobile = [];
  breakpoint$ = this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(
    public translate: TranslateService,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    private datePipe: DatePipe,
    private ibcService: IBCService,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.breakpoint$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state) {
        this.isMobileMatched = state.matches;
      }
    });
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.getTokenData();
    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.pageData.pageIndex === PAGE_EVENT.PAGE_INDEX) {
          this.searchData();
        } else {
          this.pageChange.selectPage(0);
        }
      });
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  async getListTokenIBC() {
    this.listTokenIBC = local.getItem(STORAGE_KEYS.LIST_TOKEN_IBC);
    const res = await this.tokenService.getTokenSupply();
    const supply = _.get(res, 'data.supply');
    this.listTokenIBC.forEach((token) => {
      token.type = ETokenCoinType.IBC;
      token.isHolderUp = true;
      supply.forEach((s) => {
        if (token.denom === s.denom) {
          token.totalSupply = getBalance(s?.amount || 0, token.decimal);
        }
      });
    });
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
    if (this.textSearch?.trim().length > 0) {
      this.textSearch = this.textSearch?.trim();
      const payload = {
        limit: this.pageData.pageSize,
        offset: this.pageData.pageIndex * this.pageData.pageSize,
      };
      const result = this.dataTable?.filter(
        (item) =>
          item.name?.toLowerCase().includes(this.textSearch.toLowerCase()) ||
          item.contract_address?.toLowerCase() == this.textSearch.toLowerCase() ||
          item.symbol?.toLowerCase().includes(this.textSearch.toLowerCase()) ||
          item.denom?.toLowerCase().includes(this.textSearch.toLowerCase()),
      );
      this.dataSource.data = result;
    } else {
      this.drawTable();
    }
    this.pageData.length = this.dataSource.data?.length;
  }

  getListToken() {
    // Get the first time data init screen
    this.getListTokenIBC().then((r) => {
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
                      inChainValue: +foundToken?.circulating_market_cap || 0,
                      volume: +foundToken?.total_volume || 0,
                      price: +foundToken?.current_price || 0,
                      isValueUp:
                        foundToken?.price_change_percentage_24h && foundToken?.price_change_percentage_24h >= 0,
                      change: foundToken?.price_change_percentage_24h || 0,
                      max_total_supply: foundToken?.max_supply || 0,
                      fully_diluted_market_cap: foundToken?.fully_diluted_valuation || 0,
                      totalSupply: getBalance(item.total_supply, item.decimal),
                      type: ETokenCoinType.CW20,
                    };
                  });
                  let dataList = [];
                  this.dataSource.data = [];
                  if (this.filterType.includes(ETokenCoinType.IBC)) {
                    dataList.push(...this.listTokenIBC);
                  }
                  if (this.filterType.includes(ETokenCoinType.CW20)) {
                    dataList.push(...mappedData);
                  }
                  if (this.filterType.length === 0) {
                    dataList.push(...this.listTokenIBC);
                    dataList.push(...mappedData);
                  }
                  this.dataTable = dataList;
                  this.drawTable();

                  // handle search
                  if (this.textSearch?.trim().length > 0) {
                    this.searchData();
                  } else {
                    this.pageData.length = this.dataSource.data.length;
                  }
                  this.isLoadingTable = false;
                },
                error: (e) => {
                  if (e.name === TIMEOUT_ERROR) {
                    this.errTxt = e.message;
                  } else {
                    this.errTxt = e.error.error.statusCode + ' ' + e.error.error.message;
                  }
                  this.isLoadingTable = false;
                },
              });
          },
          error: (e) => {
            if (e.name === TIMEOUT_ERROR) {
              this.errTxt = e.message;
            } else {
              this.errTxt = e.error.error.statusCode + ' ' + e.error.error.message;
            }
            this.isLoadingTable = false;
          },
        });
    });
  }

  getTokenData() {
    this.getTokenNative();
    this.getListToken();
  }

  async getTokenNative() {
    const tempTotal = await this.ibcService.getTotalSupplyLCD(this.chainInfo.coinMinimalDenom);
    this.tokenService.tokensMarket$
      .pipe(
        filter((data) => _.isArray(data)),
        take(1),
      )
      .subscribe((res) => {
        this.nativeToken = res.find((k) => k.coin_id === this.environmentService.coingecko.ids[0]);
        const totalSupply = balanceOf(_.get(tempTotal, 'data.amount.amount' || 0), this.chainInfo.coinDecimals);

        this.nativeToken = {
          ...this.nativeToken,
          name: this.chainName,
          symbol: this.chainInfo.coinDenom,
          contract_address: null,
          decimals: this.chainInfo.coinDecimals,
          totalSupply,
          price: this.nativeToken.current_price,
          inChainValue: totalSupply * this.nativeToken.current_price,
          denom: this.chainInfo.coinMinimalDenom,
          isHolderUp: true,
          type: ETokenCoinType.NATIVE,
        };
      });
  }

  drawTable() {
    const auraToken = [this.nativeToken];
    const verifiedToken = this.dataTable
      .filter((token) => token.verify_status === 'VERIFIED')
      .sort((a, b) => this.compare(a.price, b.price, false))
      .sort((a, b) => this.compare(a.inChainValue, b.inChainValue, false))
      .sort((a, b) => this.compare(a.totalSupply, b.totalSupply, false));

    const otherToken = this.dataTable
      .filter((token) => token.verify_status !== 'VERIFIED')
      .sort((a, b) => this.compare(a.price, b.price, false))
      .sort((a, b) => this.compare(a.inChainValue, b.inChainValue, false))
      .sort((a, b) => this.compare(a.totalSupply, b.totalSupply, false));

    if (this.filterType.includes(ETokenCoinType.NATIVE) || this.filterType.length === 0) {
      this.dataSource.data = [...auraToken];
    }
    this.dataSource.data = this.dataSource.data.concat(verifiedToken);
    this.dataSource.data = this.dataSource.data.concat(otherToken);

    this.dataSourceMobile = this.dataSource.data.slice(
      this.pageData.pageIndex * this.pageData.pageSize,
      this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
    );
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  // sortData(sort: Sort) {
  //   let data = this.dataTable;
  //   if (!sort.active || sort.direction === '') {
  //     this.sortedData = data;
  //     return;
  //   }

  //   const isAsc = sort.direction === 'asc';
  //   this.sortedData = data.sort((a, b) => {
  //     switch (sort.active) {
  //       case 'price':
  //         return this.compare(+a.price, +b.price, !isAsc);
  //       case 'totalSupply':
  //         return this.compare(+a.totalSupply, +b.totalSupply, !isAsc);
  //       case 'inChainValue':
  //         return this.compare(+a.inChainValue, +b.inChainValue, !isAsc);
  //       default:
  //         return 0;
  //     }
  //   });

  //   if (sort.active === 'change') {
  //     let lstUp = this.sortedData
  //       .filter((data) => data.isValueUp)
  //       ?.sort((a, b) => this.compare(a.change, b.change, isAsc));
  //     let lstDown = this.sortedData
  //       .filter((data) => !data.isValueUp)
  //       .sort((a, b) => this.compare(a.change, b.change, !isAsc));
  //     this.sortedData = isAsc ? lstDown.concat(lstUp) : lstUp.concat(lstDown);
  //   }
  //   const payload = {
  //     limit: this.pageData.pageSize,
  //     offset: this.pageData.pageIndex * this.pageData.pageSize,
  //   };

  //   let dataFilter = this.sortedData.slice(payload?.offset, payload?.offset + payload?.limit);
  //   this.pageData = {
  //     length: this.pageData.length,
  //     pageSize: this.pageData.pageSize,
  //     pageIndex: this.pageData.pageIndex,
  //   };
  //   this.dataSource.data = dataFilter;
  // }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (BigNumber(a).lt(BigNumber(b)) ? -1 : 1) * (isAsc ? 1 : -1);
  }

  resetSearch() {
    this.textSearch = '';
    this.dataSource.data = [];
    this.drawTable();
    this.pageData.length = this.dataSource.data?.length;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
    };

    this.dataSourceMobile = this.dataSource.data.slice(
      this.pageData.pageIndex * this.pageData.pageSize,
      this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
    );
  }

  filterToken(val: string = null) {
    this.isLoadingTable = true;
    if (!val) {
      this.filterType = [];
    } else if (this.filterType.includes(val)) {
      this.filterType = this.filterType.filter((item) => item !== val);
    } else {
      this.filterType.push(val);
    }
    this.getListToken();
    this.pageChange.selectPage(0);
  }
}
