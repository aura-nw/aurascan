import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { takeUntil } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CHART_OPTION, ChartOptions, chartCustomOptions } from '../chart-options';
import { ACCOUNT_WALLET_COLOR, TABS_TITLE_ACCOUNT } from 'src/app/core/constants/account.constant';
import { StakeModeAccount, TabsAccount } from 'src/app/core/constants/account.enum';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'src/app/core/services/account.service';
import { Globals, convertDataTransaction } from 'src/app/global/global';
import { WalletService } from 'src/app/core/services/wallet.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { Subject } from 'rxjs';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
})
export class TransactionListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  public chartOptions: Partial<ChartOptions>;
  currentKey = null;
  currentAddress: string;
  currentAccountDetail: any;
  textSearch = '';
  tnxType = null;

  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'fee', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
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
  currentStake = StakeModeAccount.Delegations;
  stakeMode = StakeModeAccount;
  totalValueToken = 0;
  totalValueNft = 0;
  totalAssets = 0;
  totalSBT = 0;

  isSent = true;

  constructor(
    private transactionService: TransactionService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private accountService: AccountService,
    public global: Globals,
    private walletService: WalletService,
    private layout: BreakpointObserver,
    private modalService: NgbModal,
    private environmentService: EnvironmentService,
    private soulboundService: SoulboundService,
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
        this.getTxsFromHoroscope();
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
    this.pageData = e;

    if (next && this.nextKey && this.currentKey !== this.nextKey) {
      this.getTxsFromHoroscope(this.nextKey);
      this.currentKey = this.nextKey;
    }
  }
  getTxsFromHoroscope(nextKey = null): void {
    const address = this.currentAddress;
    let payload = {
      limit: 40,
      value: address,
      heightLT: nextKey,
    };
    this.transactionService.getListTxCondition(payload).subscribe({
      next: (data) => {
        if (data?.transaction?.length > 0) {
          this.nextKey = null;
          if (data?.transaction?.length >= 40) {
            this.nextKey = data?.transaction[data?.transaction?.length - 1].height;
          }
          const txs = convertDataTransaction(data, this.coinInfo);
          txs.forEach((element) => {
            if (element.type === 'Send') {
              if (!element.messages.find((k) => k.from_address === this.currentAddress)) {
                element.type = 'Receive';
              }
            } else if (element.type === 'Multisend') {
              if (element.messages[0]?.inputs[0]?.address !== this.currentAddress) {
                element.type = 'Receive';
              }
            }
          });

          if (this.dataSource.data.length > 0) {
            this.dataSource.data = [...this.dataSource.data, ...txs];
          } else {
            this.dataSource.data = [...txs];
          }
          this.dataSourceMobile = this.dataSource.data.slice(
            this.pageData.pageIndex * this.pageData.pageSize,
            this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
          );

          this.pageData.length = this.dataSource.data.length;
        }
      },
      error: () => {
        this.transactionLoading = false;
      },
      complete: () => {
        this.transactionLoading = false;
      },
    });
  }
  reloadData() {
    location.reload();
  }
}
