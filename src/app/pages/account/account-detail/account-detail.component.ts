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
import local from '../../../../app/core/utils/storage/local';
import { ACCOUNT_WALLET_COLOR, TABS_TITLE_ACCOUNT } from '../../../core/constants/account.constant';
import {
  ACCOUNT_WALLET_COLOR_ENUM,
  PageEventType,
  StakeModeAccount,
  TabsAccount,
  WalletAcount,
} from '../../../core/constants/account.enum';
import { DATE_TIME_WITH_MILLISECOND, PAGE_EVENT } from '../../../core/constants/common.constant';
import { IAccountDetail } from '../../../core/models/account.model';
import { TableTemplate } from '../../../core/models/common.model';
import { AccountService } from '../../../core/services/account.service';
import { CommonService } from '../../../core/services/common.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { convertDataTransaction, Globals } from '../../../global/global';
import { chartCustomOptions, ChartOptions, CHART_OPTION } from './chart-options';

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
  currentAccountDetail: IAccountDetail;
  textSearch = '';
  dataSourceToken: MatTableDataSource<any>;
  dataSourceTokenBk: MatTableDataSource<any>;

  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'fee', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];

  templatesDelegation: Array<TableTemplate> = [
    { matColumnDef: 'validator_name', headerCellDef: 'Validator' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'reward', headerCellDef: 'Reward' },
  ];
  displayedColumnsDelegation: string[] = this.templatesDelegation.map((dta) => dta.matColumnDef);
  dataSourceDelegation: MatTableDataSource<any>;

  templatesUnBonding: Array<TableTemplate> = [
    { matColumnDef: 'validator_name', headerCellDef: 'Validator' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'completion_time', headerCellDef: 'Completion Time' },
  ];
  displayedColumnsUnBonding: string[] = this.templatesUnBonding.map((dta) => dta.matColumnDef);
  dataSourceUnBonding: MatTableDataSource<any>;

  templatesReDelegation: Array<TableTemplate> = [
    { matColumnDef: 'validator_src_name', headerCellDef: 'From' },
    { matColumnDef: 'validator_dst_name', headerCellDef: 'To' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'completion_time', headerCellDef: 'Time' },
  ];
  displayedColumnsReDelegation: string[] = this.templatesReDelegation.map((dta) => dta.matColumnDef);
  dataSourceReDelegation: MatTableDataSource<any>;

  templatesVesting: Array<TableTemplate> = [
    { matColumnDef: 'type_format', headerCellDef: 'Type' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'vesting_schedule', headerCellDef: 'Vesting Schedule' },
  ];
  displayedColumnsVesting: string[] = this.templatesVesting.map((dta) => dta.matColumnDef);
  dataSourceVesting: MatTableDataSource<any>;

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  nextKey = null;

  pageDataToken: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  pageDataDelegation: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  pageDataUnbonding: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  pageDataRedelegation: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  pageDataVesting: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  dataSourceMobile: any[];
  pageEventType = PageEventType;
  searchNullData = false;
  chartCustomOptions = chartCustomOptions;

  // loading param check
  transactionLoading = true;
  accDetailLoading = true;
  chartLoading = true;
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
  stakeMode = StakeModeAccount;
  TABS_STAKE = [
    {
      key: StakeModeAccount.Delegations,
      label: 'Delegations',
    },
    {
      key: StakeModeAccount.Unbondings,
      label: 'Unbondings',
    },
    {
      key: StakeModeAccount.Redelegations,
      label: 'Redelegations',
    },
    {
      key: StakeModeAccount.Vestings,
      label: 'Vestings',
    },
  ];
  currentTab = TabsAccount.Assets;
  currentStake = StakeModeAccount.Delegations;
  totalValueToken = 0;
  totalValueNft = 0;
  totalAssets = 0;
  totalSBT = 0;

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
        this.accDetailLoading = true;

        this.dataSourceToken = new MatTableDataSource();
        this.dataSourceDelegation = new MatTableDataSource();
        this.dataSourceUnBonding = new MatTableDataSource();
        this.dataSourceReDelegation = new MatTableDataSource();
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
        this.accDetailLoading = false;
        this.chartLoading = false;
        this.currentAccountDetail = dataAccount;
        this.dataSourceToken.data = dataAccount.balances;
        this.pageDataToken.length = dataAccount?.balances?.length;

        this.chartOptions = JSON.parse(data?.dataChart);
      }
    }
  }

  copyMessage(text: string) {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    // fake event click out side copy button
    // this event for hidden tooltip
    setTimeout(function () {
      document.getElementById('currentAddress').click();
    }, 800);
  }

  changePage(page: any): void {
    switch (page.pageEventType) {
      case this.pageEventType.Delegation:
        this.pageDataDelegation.pageIndex = page.pageIndex;
        break;
      case this.pageEventType.Unbonding:
        this.pageDataUnbonding.pageIndex = page.pageIndex;
        break;
      case this.pageEventType.Redelegation:
        this.pageDataRedelegation.pageIndex = page.pageIndex;
        break;
      case this.pageEventType.Vestings:
        this.pageDataVesting.pageIndex = page.pageIndex;
        break;
      case this.pageEventType.Token:
        this.pageDataToken.pageIndex = page.pageIndex;
        break;
      default:
        break;
    }
  }

  getTxsFromHoroscope(nextKey = null): void {
    const chainId = this.environmentService.configValue.chainId;
    const address = this.currentAddress;

    this.transactionService.getAccountTxFromHoroscope(chainId, address, 40, nextKey).subscribe({
      next: (txResponse) => {
        const { code, data } = txResponse;
        this.nextKey = data.nextKey || null;

        if (code === 200) {
          const txs = convertDataTransaction(data, this.coinInfo);
          txs.forEach((element) => {
            if (element.type === 'Send') {
              if (!element.messages.find((k) => k.from_address === this.currentAddress)) {
                element.type = 'Receive';
              }
            } else if (element.type === 'Multi Send') {
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
    this.accountService.getAccountDetail(this.currentAddress).subscribe((res) => {
      this.chartLoading = true;
      this.accDetailLoading = true;
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
        this.dataSourceToken.data = this.currentAccountDetail?.balances;
        this.pageDataToken.length = this.currentAccountDetail?.balances?.length;
        this.dataSourceTokenBk = this.dataSourceToken;

        this.dataSourceDelegation.data = this.currentAccountDetail?.delegations;
        this.pageDataDelegation.length = this.currentAccountDetail?.delegations?.length;

        this.dataSourceUnBonding.data = this.currentAccountDetail?.unbonding_delegations;
        this.pageDataUnbonding.length = this.currentAccountDetail?.unbonding_delegations?.length;
        this.dataSourceReDelegation.data = this.currentAccountDetail?.redelegations;
        this.pageDataRedelegation.length = this.currentAccountDetail?.redelegations?.length;

        if (this.currentAccountDetail?.vesting) {
          this.dataSourceVesting = new MatTableDataSource([this.currentAccountDetail?.vesting]);
          this.pageDataVesting.length = 1;
        }
        this.accDetailLoading = false;
        this.chartLoading = false;

        if (this.userAddress === this.currentAddress) {
          local.removeItem('accountDetail');
          //store data wallet info
          let accountDetail = {};
          accountDetail['dataAccount'] = JSON.stringify(this.currentAccountDetail);
          accountDetail['dataChart'] = JSON.stringify(this.chartOptions);
          local.setItem('accountDetail', accountDetail);
        }
      }
    });
  }

  searchToken(): void {
    this.searchNullData = false;

    if (this.textSearch.length > 0) {
      const data = this.dataSourceTokenBk.data.filter(
        (f) => f.name.toLowerCase().indexOf(this.textSearch.toLowerCase().trim()) > -1,
      );
      if (data && data.length === 0) {
        this.searchNullData = true;
      }
      this.dataSourceToken = this.dataSourceTokenBk;
      this.dataSourceToken = new MatTableDataSource(data);
    } else {
      this.dataSourceToken = this.dataSourceTokenBk;
    }
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

  splitDataSource(d: any[]) {
    return d.slice(0, 5);
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
}
