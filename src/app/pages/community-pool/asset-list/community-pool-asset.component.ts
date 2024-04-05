import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { TranslateService } from '@ngx-translate/core';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { PROPOSAL_STATUS } from 'src/app/core/constants/proposal.constant';
import { ETokenCoinTypeBE, MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { TokenService } from 'src/app/core/services/token.service';
import { balanceOf, getBalance } from 'src/app/core/utils/common/parsing';
import { shortenAddress } from 'src/app/core/utils/common/shorten';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';

@Component({
  selector: 'app-community-pool-asset',
  templateUrl: './community-pool-asset.component.html',
  styleUrls: ['./community-pool-asset.component.scss'],
})
export class CommunityPoolAssetComponent implements OnInit, OnDestroy {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'name', headerCellDef: 'name' },
    { matColumnDef: 'symbol', headerCellDef: 'symbol' },
    { matColumnDef: 'amount', headerCellDef: 'amount' },
  ];

  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  pageSizeMob = 5;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  dataSource: MatTableDataSource<any>;
  dataSourceMob: any[];
  filterSearchData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  listAssetLcd = [];
  searchSubject = new Subject();
  destroy$ = new Subject<void>();
  statusConstant = PROPOSAL_STATUS;
  isLoading = true;
  errText = null;

  chainName = this.environmentService.chainName;
  denom = this.environmentService.chainInfo.currencies[0].coinDenom;

  constructor(
    public translate: TranslateService,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
  ) {}

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.getListAsset();

    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.pageData.pageIndex === PAGE_EVENT.PAGE_INDEX) {
          this.getListAsset();
        } else {
          this.pageChange.selectPage(0);
        }
      });
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }

  async getListAsset() {
    if (this.textSearch) {
      this.filterSearchData = this.listAssetLcd;
      this.filterSearchData = this.filterSearchData.filter(
        (k) =>
          k.name.toLowerCase().includes(this.textSearch.toLowerCase()) === true ||
          k.symbol.toLowerCase().includes(this.textSearch.toLowerCase()) === true,
      );
      this.dataSource.data = this.filterSearchData.slice(
        this.pageData.pageIndex * this.pageData.pageSize,
        this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
      );
      this.dataSourceMob = this.filterSearchData.slice(
        this.pageData.pageIndex * this.pageSizeMob,
        this.pageData.pageIndex * this.pageSizeMob + this.pageSizeMob,
      );
      this.pageData.length = this.filterSearchData.length;
    } else {
      try {
        const res = await this.tokenService.getListAssetCommunityPool();
        this.listAssetLcd = _.get(res, 'data.pool');
        this.tokenService.tokensMarket$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
          this.listAssetLcd.forEach((element) => {
            element.isNative = false;
            let findItem = res?.find((i) => i.denom === element.denom);
            if (findItem) {
              element.decimal = findItem.decimal;
              element.symbol = findItem.display || findItem.symbol;
              element.logo = findItem.logo || findItem.image;
              element.isNative = findItem.type === ETokenCoinTypeBE?.NATIVE;
              element.name =
                findItem.type === ETokenCoinTypeBE?.NATIVE ? this.environmentService.chainName : findItem.name;
            }
          });

          this.listAssetLcd = this.listAssetLcd?.filter((k) => k.denom && k.symbol);
          this.listAssetLcd = this.listAssetLcd?.sort((a, b) => {
            return this.compare(balanceOf(a.amount, a.decimal), balanceOf(b.amount, b.decimal), false);
          });
          this.filterSearchData = this.listAssetLcd;
          if (!this.dataSource) {
            this.dataSource = new MatTableDataSource<any>(this.listAssetLcd);
            this.dataSourceMob = this.listAssetLcd.slice(
              this.pageData.pageIndex * this.pageSizeMob,
              this.pageData.pageIndex * this.pageSizeMob + this.pageSizeMob,
            );
          } else {
            this.dataSource.data = this.listAssetLcd;
            this.dataSourceMob = this.listAssetLcd.slice(
              this.pageData.pageIndex * this.pageSizeMob,
              this.pageData.pageIndex * this.pageSizeMob + this.pageSizeMob,
            );
          }
        });
      } catch (e) {
        this.errText = e['status'] + ' ' + e['statusText'];
      }
    }
    this.isLoading = false;
  }

  paginatorEmit(event): void {
    if (this.dataSource) {
      this.dataSource.paginator = event;
    } else {
      this.dataSource = new MatTableDataSource<any>();
      this.dataSource.paginator = event;
    }
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
    this.getListAsset();
  }
}
