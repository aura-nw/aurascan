import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ACCOUNT_WALLET_COLOR, TABS_TITLE_ACCOUNT } from 'src/app/core/constants/account.constant';
import { TabsAccount } from 'src/app/core/constants/account.enum';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { TYPE_TRANSACTION } from "src/app/core/constants/transaction.constant";
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { Globals } from 'src/app/global/global';
import { CHART_OPTION, ChartOptions, chartCustomOptions } from '../chart-options';

@Component({
  selector: 'app-account-transaction',
  templateUrl: './account-transaction.component.html',
  styleUrls: ['./account-transaction.component.scss'],
})

export class AccountTransactionComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  public chartOptions: Partial<ChartOptions>;
  currentKey = null;
  currentAddress: string;
  currentAccountDetail: any;
  textSearch = '';

  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'fee', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];

  pageDataExecute: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  pageDataAura: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  pageDataFts: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  pageDataNft: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  nextKey = null;

  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  dataSourceMobile: any[];
  chartCustomOptions = chartCustomOptions;

  // loading param check
  transactionLoading = true;
  modalReference: any;
  isNoData = false;

  destroyed$ = new Subject();
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));

  coinInfo = this.environmentService.configValue.chain_info.currencies[0];
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  TABS = TABS_TITLE_ACCOUNT;
  tabsData = TabsAccount;

  currentTab = TabsAccount.ExecutedTxs;
  totalValueToken = 0;
  totalValueNft = 0;
  totalAssets = 0;
  totalSBT = 0;
  transactionFilter;
  transactionTypeKeyWord = '';

  isSent = true;
  tnxType = TYPE_TRANSACTION;

  constructor(
    public commonService: CommonService,
    private route: ActivatedRoute,
    public global: Globals,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
  ) {
    this.chartOptions = CHART_OPTION();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.chartCustomOptions = [...ACCOUNT_WALLET_COLOR];
    this.route.params.subscribe((params) => {
      if (params?.address) {
        this.currentAddress = params?.address;
        this.transactionLoading = true;

        this.dataSource = new MatTableDataSource();
      }
    });
  }

  paginatorEmit(e: MatPaginator): void {
    if (this.dataSource.paginator) {
      e.page.next({
        length: this.dataSource.paginator.length,
        pageIndex: 0,
        pageSize: this.dataSource.paginator.pageSize,
        previousPageIndex: this.dataSource.paginator.pageIndex,
      });
      this.dataSource.paginator = e;
    } else this.dataSource.paginator = e;
  }

  pageEvent(e: PageEvent): void {
    const { length, pageIndex, pageSize } = e;
    const next = length <= (pageIndex + 2) * pageSize;
    this.dataSourceMobile = this.dataSource.data.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
    this.pageDataExecute = e;

    if (next && this.nextKey && this.currentKey !== this.nextKey) {
      this.currentKey = this.nextKey;
    }
  }

  reloadData() {
    location.reload();
  }
}
