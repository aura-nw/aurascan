import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { PAGE_EVENT } from '../../../../core/constants/common.constant';
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

  searchSubject = new Subject();
  destroy$ = new Subject();

  constructor(
    public translate: TranslateService,
    public global: Globals,
    public tokenService: TokenService,
    private environmentService: EnvironmentService,
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

  getListToken() {
    this.textSearch = this.textSearch?.trim();
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      keyword: this.textSearch,
    };

    this.tokenService.getListToken(payload).subscribe((res) => {
      const cw20data = _.get(res, `cw20_contract`);
      const count = _.get(res, `cw20_contract_aggregate`);
      const listAddress = cw20data.map((item) => item.smart_contract.address);
      const reqPayload = { contractAddress: listAddress };
      this.tokenService.getTokenMarketData(reqPayload).subscribe((tokenMarket) => {
        const dataFlat = cw20data?.map((item) => {
          const tokenFind = tokenMarket?.find((f) => String(f.contract_address) === item.smart_contract.address);

          return {
            coin_id: tokenFind?.coin_id || '',
            contract_address: item.smart_contract.address || '',
            name: item.name || '',
            symbol: item.symbol || '',
            image: item.marketing_info?.logo?.url ? item.marketing_info?.logo?.url : tokenFind?.image || '',
            description: tokenFind?.description || '',
            verify_status: tokenFind?.verify_status || '',
            verify_text: tokenFind?.verify_text || '',
            circulating_market_cap: tokenFind?.circulating_market_cap || 0,
            volume_24h: tokenFind?.total_volume || 0,
            price: tokenFind?.current_price || 0,
            price_change_percentage_24h: tokenFind?.price_change_percentage_24h || 0,
            holders_change_percentage_24h: 0,
            holders: item.cw20_holders_aggregate?.aggregate?.count,
            max_total_supply: tokenFind?.max_supply || 0,
            fully_diluted_market_cap: tokenFind?.fully_diluted_valuation || 0,
          };
        });
        dataFlat.forEach((data) => {
          Object.assign(data, {
            ...data,
            circulating_market_cap: +data.circulating_market_cap || 0,
            onChainMarketCap: +data.circulating_market_cap || 0,
            volume: +data.volume_24h,
            price: +data.price,
            isValueUp: data.price_change_percentage_24h < 0 ? false : true,
            change: Number(data.price_change_percentage_24h.toString()),
            isHolderUp: data.holders_change_percentage_24h < 0 ? false : true,
            holders: +data.holders,
            holderChange: Number(data.holders_change_percentage_24h.toString()),
          });
        });
        this.dataSource = new MatTableDataSource<any>(dataFlat);
        this.pageData.length = count.aggregate.count;
      });
    });
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

    // if (sort.active === 'holders') {
    //   let lstUp = this.sortedData
    //     .filter((data) => data.isValueUp)
    //     ?.sort((a, b) => this.compare(a.holders, b.holders, isAsc));
    //   let lstDown = this.sortedData
    //     .filter((data) => !data.isValueUp)
    //     .sort((a, b) => this.compare(a.holders, b.holders, !isAsc));
    //   this.sortedData = isAsc ? lstDown.concat(lstUp) : lstUp.concat(lstDown);
    // }

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
