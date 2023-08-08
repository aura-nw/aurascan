import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChartComponent } from 'ng-apexcharts';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LIMIT_NUM_SBT } from 'src/app/core/constants/soulbound.constant';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { EnvironmentService } from '../../../../app/core/data-services/environment.service';
import { WalletService } from '../../../../app/core/services/wallet.service';
import { ACCOUNT_WALLET_COLOR, TABS_TITLE_ACCOUNT } from '../../../core/constants/account.constant';
import {
  ACCOUNT_WALLET_COLOR_ENUM,
  PageEventType,
  StakeModeAccount,
  TabsAccount,
  WalletAcount,
} from '../../../core/constants/account.enum';
import { DATE_TIME_WITH_MILLISECOND, PAGE_EVENT } from '../../../core/constants/common.constant';
import { TableTemplate } from '../../../core/models/common.model';
import { AccountService } from '../../../core/services/account.service';
import { CommonService } from '../../../core/services/common.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { Globals, convertDataTransaction } from '../../../global/global';
import { CHART_OPTION, ChartOptions, chartCustomOptions } from './chart-options';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('assetTypeSelect') assetTypeSelect: MatSelect;
  @HostListener('window:scroll', ['$event'])
  closeOptionPanelSection(_) {
    if (this.assetTypeSelect !== undefined) {
      this.assetTypeSelect.close();
    }
  }
  public chartOptions: Partial<ChartOptions>;
  @ViewChild('walletChart') chart: ChartComponent;
  @ViewChild(MatSort) sort: MatSort;

  currentAddress: string;
  currentKey = null;
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
  userAddress = '';
  modalReference: any;
  isNoData = false;

  destroyed$ = new Subject();
  timerUnSub: Subscription;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));
  timeStaking = `${this.environmentService.configValue.timeStaking}`;

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
    this.timeStaking = (Number(this.timeStaking) / DATE_TIME_WITH_MILLISECOND).toString();
    this.chartCustomOptions = [...ACCOUNT_WALLET_COLOR];
    this.route.params.subscribe((params) => {
      if (params?.address) {
        this.currentAddress = params?.address;
        this.transactionLoading = true;

        this.dataSource = new MatTableDataSource();

        this.loadDataTemp();
        this.getAccountDetail();
        this.getTxsFromHoroscope();
      }
    });
  }

  /**
   * ngOnDestroy
   */
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();

    if (this.timerUnSub) {
      this.timerUnSub.unsubscribe();
    }
  }

  loadDataTemp(): void {
    //get data from client for my account
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.userAddress = wallet.bech32Address;
      }
      this.getSBTPick();
    });

    let retrievedObject = localStorage.getItem('accountDetail');
    if (retrievedObject) {
      let data = JSON.parse(retrievedObject);
      let dataAccount = JSON.parse(data?.dataAccount);
      if (dataAccount && dataAccount.acc_address === this.currentAddress) {
        this.currentAccountDetail = dataAccount;

        this.chartOptions = JSON.parse(data?.dataChart);
      }
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

  getAccountDetail(): void {
    this.isNoData = false;
    const halftime = 15000;
    this.accountService.getAccountDetail(this.currentAddress).subscribe(
      (res) => {
        if (res.data.code === 200 && !res.data?.data) {
          this.isNoData = true;
          setTimeout(() => {
            this.getAccountDetail();
          }, halftime);
          return;
        }

        if (res?.data) {
          this.currentAccountDetail = res.data;
          this.chartOptions.series = [];
          if (+this.currentAccountDetail.commission > 0) {
            this.chartOptions.labels.push(ACCOUNT_WALLET_COLOR_ENUM.Commission);
            this.chartOptions.colors.push(WalletAcount.Commission);
            this.chartCustomOptions.push({
              name: ACCOUNT_WALLET_COLOR_ENUM.Commission,
              color: WalletAcount.Commission,
              amount: '0.000000',
            });
          } else {
            this.chartCustomOptions = chartCustomOptions;
          }

          this.chartCustomOptions.forEach((f) => {
            switch (f.name) {
              case ACCOUNT_WALLET_COLOR_ENUM.Available:
                f.amount = this.currentAccountDetail.available;
                break;
              case ACCOUNT_WALLET_COLOR_ENUM.Delegated:
                f.amount = this.currentAccountDetail.delegated;
                break;
              case ACCOUNT_WALLET_COLOR_ENUM.StakingReward:
                f.amount = this.currentAccountDetail.stake_reward;
                break;
              case ACCOUNT_WALLET_COLOR_ENUM.Commission:
                f.amount = this.currentAccountDetail.commission;
                break;
              case ACCOUNT_WALLET_COLOR_ENUM.Unbonding:
                f.amount = this.currentAccountDetail.unbonding;
                break;
              case ACCOUNT_WALLET_COLOR_ENUM.DelegableVesting:
                f.amount = this.currentAccountDetail?.delegable_vesting;
                break;
              default:
                break;
            }
            f.amount = f.amount || '0';
            this.chartOptions.series.push(Number(f.amount));
          });
        }
      },
      () => {},
      () => {
      },
    );
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

  viewQrAddress(staticDataModal: any): void {
    this.modalReference = this.modalService.open(staticDataModal, {
      keyboard: false,
      centered: true,
      size: 'sm',
      windowClass: 'modal-holder contact-qr-modal',
    });
  }

  closePopup() {
    this.modalReference.close();
  }

  reloadData() {
    location.reload();
  }

  getSBTPick() {
    const payload = {
      receiverAddress: this.currentAddress,
      limit: LIMIT_NUM_SBT,
    };

    this.soulboundService.getSBTPick(payload).subscribe((res) => {
      if (this.userAddress && this.currentAddress !== this.userAddress) {
        res.data = res.data.filter((k) => k.picked);
      }
      this.totalSBT = res.data.length;
    });
  }

  extendLink(url) {
    url = url.match(/^https?:/) ? url : '//' + url;
    return url;
  }
}
