import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import BigNumber from 'bignumber.js';
import { Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { PAGE_EVENT, TIMEOUT_ERROR } from '../../../core/constants/common.constant';
import { ETokenCoinType, ETokenCoinTypeBE, MAX_LENGTH_SEARCH_TOKEN } from '../../../core/constants/token.constant';
import { TableTemplate } from '../../../core/models/common.model';
import { EWalletType } from 'src/app/core/constants/wallet.constant';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-fungible-tokens',
  templateUrl: './fungible-tokens.component.html',
  styleUrls: ['./fungible-tokens.component.scss'],
})
export class FungibleTokensComponent implements OnInit, OnDestroy {
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
  isLoadingTable = true;
  filterType = [];
  ETokenCoinType = ETokenCoinType;
  ETokenCoinTypeBE = ETokenCoinTypeBE;
  searchSubject = new Subject();
  destroy$ = new Subject<void>();
  listTokenIBC: any;
  nativeToken: any;
  lstCw20Token = [];
  listDataFilter = [];

  breakpoint$ = this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(
    public translate: TranslateService,
    private tokenService: TokenService,
    public environmentService: EnvironmentService,
    private breakpointObserver: BreakpointObserver,
    private route: Router,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.activeRoute.fragment.subscribe((fragment) => {
      this.filterType = fragment?.split(',') || [];
      this.getListToken();
      this.searchSubject
        .asObservable()
        .pipe(debounceTime(500), takeUntil(this.destroy$))
        .subscribe(() => {
          this.textSearch = this.textSearch?.trim();
          this.pageChange.selectPage(0);
        });
      });
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  getListToken() {
    // Get the first time data init screen
    let payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageSize * this.pageData.pageIndex,
      keyword: this.textSearch?.startsWith(EWalletType.EVM) ? this.textSearch?.toLowerCase() : this.textSearch || '',
    };
    if (this.filterType?.length > 0) {
      payload['type'] = this.filterType?.toString();
    }

    this.tokenService
      .getListToken(payload)
      .pipe(
        map((tokens) => {
          tokens?.data?.forEach((token) => {
            token.price = token.currentPrice;
            token.holders =
              token?.tokenHolderStatistics?.length > 0
                ? token?.tokenHolderStatistics?.[token?.tokenHolderStatistics?.length - 1]?.totalHolder
                : 0;
            let changePercent = 0;
            if (
              token.tokenHolderStatistics?.length > 1 &&
              token.tokenHolderStatistics[0]?.totalHolder > 0 &&
              token.tokenHolderStatistics[1]?.totalHolder > 0
            ) {
              changePercent =
                (token.tokenHolderStatistics[1].totalHolder * 100) / token.tokenHolderStatistics[0].totalHolder - 100;
            }
            token.isHolderUp = changePercent >= 0;
            token.holderChange = Math.abs(changePercent);
            token.typeOrigin = token.type;

            // set data for native coin
            if (token.type === ETokenCoinTypeBE.NATIVE) {
              token.symbol = this.chainInfo.coinDenom;
              token.name = this.environmentService.chainInfo.chainName;
            }

            token.type =
              token.type === ETokenCoinTypeBE.NATIVE
                ? ETokenCoinType.NATIVE
                : token.type === ETokenCoinTypeBE.CW20
                  ? ETokenCoinType.CW20
                  : token.type === ETokenCoinTypeBE.ERC20
                    ? ETokenCoinType.ERC20
                    : ETokenCoinType.IBC;
            token.linkToken = '/token';
          });
          return tokens;
        }),
      )
      .subscribe(
        (res) => {
          this.dataSource = new MatTableDataSource<any>(res.data);
          this.pageData.length = res.meta?.count;
          this.isLoadingTable = false;
        },
        (error) => {
          if (error.name === TIMEOUT_ERROR) {
            this.errTxt = error.message;
          } else {
            this.errTxt = error.error.error.statusCode + ' ' + error.error.error.message;
          }
          this.isLoadingTable = false;
        },
      );
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (BigNumber(a).lt(BigNumber(b)) ? -1 : 1) * (isAsc ? 1 : -1);
  }

  resetSearch() {
    this.textSearch = '';
    this.dataSource.data = [];
    this.isLoadingTable = true;
    this.pageChange.selectPage(0);
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListToken();
  }

  filterToken(val: string = null, event?: Event) {
    this.isLoadingTable = true;
    if (!val) {
      this.filterType = [];
    } else if (this.filterType?.includes(val)) {
      this.filterType = this.filterType?.filter((item) => item !== val);
    } else {
      this.filterType.push(val);
    }
    if (this.filterType.length > 1) {
      this.route.navigate([], {fragment: this.filterType?.toString()});
    } else {
      this.route.navigate([], {fragment: this.filterType?.toString()});
    }
    this.pageData.length = this.dataSource.data.length;
    this.pageChange.selectPage(0);
  }
}
