import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { TokenService } from 'src/app/core/services/token.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';

@Component({
  selector: 'app-community-pool',
  templateUrl: './community-pool.component.html',
  styleUrls: ['./community-pool.component.scss'],
})
export class CommunityPoolComponent implements OnInit, OnDestroy {
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
    pageSize: 5,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  assetList: [];
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
  pool: any = [
    {
      denom: 'utaura',
      amount: '66655519380.574680591140134408',
    },
    {
      denom: 'ibc/40CA5EF447F368B7F2276A689383BE3C427B15395D4BF6639B605D36C0846A20',
      amount: '1000000.000000000000000000',
    },
    {
      denom: '12',
      amount: '1',
    },
    {
      denom: '13',
      amount: '2',
    },
    {
      denom: '14',
      amount: '3',
    },
    {
      denom: '15',
      amount: '4',
    },
    {
      denom: '16',
      amount: '4',
    },
    {
      denom: '17',
      amount: '4',
    },
    {
      denom: '18',
      amount: '4',
    },
    {
      denom: '19',
      amount: '4',
    },
    {
      denom: '20',
      amount: '4',
    },
    {
      denom: '21',
      amount: '4',
    },
    {
      denom: '22',
      amount: '4',
    },
    {
      denom: '23',
      amount: '4',
    },
    {
      denom: '24',
      amount: '4',
    },
    {
      denom: '25',
      amount: '4',
    },
    {
      denom: '26',
      amount: '4',
    },
    {
      denom: '27',
      amount: '4',
    },
    {
      denom: '28',
      amount: '4',
    },
    {
      denom: '29',
      amount: '4',
    },
  ];

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

  async getListAsset() {
    let auraAsset;
    if (this.textSearch) {
      this.filterSearchData = this.listAssetLcd;
      this.filterSearchData = this.filterSearchData.filter(
        (k) =>
          k.name.toLowerCase().includes(this.textSearch.toLowerCase()) === true ||
          k.symbol.toLowerCase().includes(this.textSearch.toLowerCase()) === true,
      );
      this.dataSource = new MatTableDataSource<any>(
        this.filterSearchData.slice(
          this.pageData.pageIndex * this.pageData.pageSize,
          this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
        ),
      );
      this.dataSourceMob = this.dataSource.data.slice(
        this.pageData.pageIndex * this.pageData.pageSize,
        this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
      );
      this.pageData.length = this.filterSearchData.length;
    } else {
      const res = await this.tokenService.getListAssetCommunityPool();
      // this.listAssetLcd = _.get(res, 'data.pool');
      let abc = this.pool;
      this.listAssetLcd = abc;

      this.listAssetLcd.forEach((element) => {
        let test = this.listCoin.find((i) => i.denom === element.denom);
        if (test) {
          element.decimal = test.decimal;
          element.symbol = test.display;
          element.logo = test.logo;
          element.name = test.name;
        } else {
          element.decimal = 6;
          element.symbol = '';
          element.logo = '';
          element.name = 'Aura';
          auraAsset = element;
        }
      });
      this.listAssetLcd = this.listAssetLcd.filter((k) => k.symbol !== '');
      this.listAssetLcd = this.listAssetLcd.sort((a, b) => {
        return this.compare(a.amount, b.amount, false);
      });
      this.listAssetLcd.unshift(auraAsset);
      this.filterSearchData = this.listAssetLcd;
      if (!this.dataSource) {
        this.dataSource = new MatTableDataSource<any>(
          this.listAssetLcd.slice(
            this.pageData.pageIndex * this.pageData.pageSize,
            this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
          ),
        );
      } else {
        this.dataSource.data = this.listAssetLcd.slice(
          this.pageData.pageIndex * this.pageData.pageSize,
          this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
        );
      }
      this.dataSourceMob = this.dataSource.data.slice(
        this.pageData.pageIndex * this.pageData.pageSize,
        this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
      );
      this.pageData.length = this.listAssetLcd.length;
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
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
