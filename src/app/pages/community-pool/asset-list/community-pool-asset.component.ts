import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { NUMBER_CONVERT, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { PROPOSAL_STATUS } from 'src/app/core/constants/proposal.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { TokenService } from 'src/app/core/services/token.service';
import { balanceOf } from 'src/app/core/utils/common/parsing';
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
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';
  listCoin = this.environmentService.configValue.coins;
  listAssetLcd = [];
  searchSubject = new Subject();
  destroy$ = new Subject();
  statusConstant = PROPOSAL_STATUS;

  constructor(
    public translate: TranslateService,
    public tokenService: TokenService,
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
    let auraAsset;
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
      const res = await this.tokenService.getListAssetCommunityPool();
      this.listAssetLcd = _.get(res, 'data.pool');

      this.listAssetLcd.forEach((element) => {
        let findItem = this.listCoin.find((i) => i.denom === element.denom);
        if (findItem) {
          element.decimal = findItem.decimal;
          element.symbol = findItem.display;
          element.logo = findItem.logo;
          element.name = findItem.name;
        } else {
          element.decimal = 6;
          element.symbol = '';
          element.logo = '';
          element.name = 'Aura';
          element.amount = element.amount / NUMBER_CONVERT;
          auraAsset = element;
        }
      });
      this.listAssetLcd = this.listAssetLcd.filter((k) => k.symbol !== '');
      this.listAssetLcd = this.listAssetLcd.sort((a, b) => {
        return this.compare(balanceOf(a.amount, a.decimal), balanceOf(b.amount, b.decimal), false);
      });
      this.listAssetLcd.unshift(auraAsset);
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
      this.pageData.length = this.listAssetLcd.length;
    }
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
