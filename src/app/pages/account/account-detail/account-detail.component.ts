import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChartComponent } from 'ng-apexcharts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EnvironmentService } from '../../../../app/core/data-services/environment.service';
import { WalletService } from '../../../../app/core/services/wallet.service';
import { balanceOf } from '../../../../app/core/utils/common/parsing';
import local from '../../../../app/core/utils/storage/local';
import { ACCOUNT_WALLET_COLOR, TYPE_ACCOUNT } from '../../../core/constants/account.constant';
import {
  ACCOUNT_TYPE_ENUM,
  ACCOUNT_WALLET_COLOR_ENUM,
  PageEventType,
  WalletAcount
} from '../../../core/constants/account.enum';
import { DATE_TIME_WITH_MILLISECOND, PAGE_EVENT } from '../../../core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../core/constants/transaction.constant';
import {
  CodeTransaction,
  StatusTransaction,
  TRANSACTION_TYPE_ENUM,
  TypeTransaction
} from '../../../core/constants/transaction.enum';
import { IAccountDetail } from '../../../core/models/account.model';
import { ResponseDto, TableTemplate } from '../../../core/models/common.model';
import { AccountService } from '../../../core/services/account.service';
import { CommonService } from '../../../core/services/common.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { getAmount, Globals } from '../../../global/global';
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

  currentAccountDetail: IAccountDetail;
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'fee', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];

  templatesToken: Array<TableTemplate> = [
    { matColumnDef: 'token_name', headerCellDef: 'Name' },
    { matColumnDef: 'token_amount', headerCellDef: 'Amount' },
    { matColumnDef: 'total_value', headerCellDef: 'Total Value' },
  ];
  displayedColumnsToken: string[] = this.templatesToken.map((dta) => dta.matColumnDef);
  dataSourceToken: MatTableDataSource<any>;
  dataSourceTokenBk: MatTableDataSource<any>;

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

  typeTransaction = TYPE_TRANSACTION;
  pageEventType = PageEventType;
  assetsType = TYPE_ACCOUNT;
  isCopy = false;
  tokenPrice = 0;
  selected = ACCOUNT_TYPE_ENUM.All;
  searchNullData = false;
  chartCustomOptions = chartCustomOptions;
  assetCW20: any[] = [];
  assetCW721: any[] = [];

  // loading param check
  accDetailLoading = true;
  chartLoading = true;
  userAddress = '';
  lstBalanceAcount = undefined;
  modalReference: any;

  destroyed$ = new Subject();
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));
  timeStaking = `${this.environmentService.configValue.timeStaking}`;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;

  TABS = ['ASSETS', 'TRANSACTIONS', 'STAKE'];
  TABS_STAKE = [
    {
      key: 0,
      label: 'Delegations',
    },
    {
      key: 1,
      label: 'Unbondings',
    },
    {
      key: 2,
      label: 'Redelegations',
    },
    {
      key: 3,
      label: 'Vestings',
    },
  ];
  currentTab = 'ASSETS';
  currentStake = 0;

  constructor(
    private transactionService: TransactionService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private accountService: AccountService,
    public global: Globals,
    private walletService: WalletService,
    private layout: BreakpointObserver,
    private modalService: NgbModal,
    private numberPipe: DecimalPipe,
    private environmentService: EnvironmentService,
  ) {
    this.chartOptions = CHART_OPTION();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.timeStaking = (Number(this.timeStaking) / DATE_TIME_WITH_MILLISECOND).toString();
    this.chartCustomOptions = [...ACCOUNT_WALLET_COLOR];
    // this.walletService.wallet$.subscribe((wallet) => {
    //   if (wallet) this.currentAddress = wallet.bech32Address;
    // });
    this.route.params.subscribe((params) => {
      if (params?.id) {
        this.currentAddress = params?.id;
        this.loadDataTemp();
        this.getAccountDetail();
        this.getListTransaction();
      }
    });
  }

  loadDataTemp(): void {
    //get data from client for my account
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.userAddress = wallet.bech32Address;
      }
    });

    let retrievedObject = localStorage.getItem('accountDetail');
    if (retrievedObject) {
      let data = JSON.parse(retrievedObject);
      let dataAccount = JSON.parse(data?.dataAccount);
      if (dataAccount && dataAccount.acc_address === this.currentAddress) {
        this.accDetailLoading = false;
        this.chartLoading = false;
        this.currentAccountDetail = dataAccount;
        this.dataSourceToken = new MatTableDataSource(dataAccount.balances);
        this.pageDataToken.length = dataAccount.balances.length;

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
        this.getListTransaction();
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
        this.pageData.pageIndex = page.pageIndex;
        this.getListTransaction();
        break;
    }
  }

  getListTransaction(): void {
    this.transactionService
      .txsWithAddress(this.pageData.pageSize, this.pageData.pageIndex * this.pageData.pageSize, this.currentAddress)
      .subscribe((res: ResponseDto) => {
        if (res?.data?.length > 0) {
          res.data.forEach((trans) => {
            //get amount of transaction
            trans.typeOrigin = trans.type;
            trans.amount = getAmount(trans.messages, trans.type, trans.raw_log, this.coinMinimalDenom);
            const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === trans.type.toLowerCase());
            trans.type = typeTrans?.value;
            trans.status = StatusTransaction.Fail;
            if (trans.code === CodeTransaction.Success) {
              trans.status = StatusTransaction.Success;
            }
            if (trans.type === TypeTransaction.Send && trans?.messages[0]?.from_address !== this.currentAddress) {
              trans.type = TypeTransaction.Received;
            }
          });
          this.dataSource.data = res.data;
          this.pageData.length = res.meta.count;
        }
      });
  }

  getAccountDetail(): void {
    this.accountService.getAccountDetail(this.currentAddress).subscribe((res) => {
      this.chartLoading = true;
      this.accDetailLoading = true;
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
            case ACCOUNT_WALLET_COLOR_ENUM.DelegatableVesting:
              f.amount = this.currentAccountDetail?.delegatable_vesting;
              break;
            default:
              break;
          }
          f.amount = f.amount || '0';
          this.chartOptions.series.push(Number(f.amount));
        });

        this.currentAccountDetail?.balances?.forEach((token) => {
          token.price = 0;
          if (token.name === this.denom) {
            token.amount = this.currentAccountDetail.total;
          }
          token.total_value = token.price * Number(token.amount);
        });
        this.tokenPrice = 0;

        this.currentAccountDetail?.balances?.forEach((f) => {
          f.token_amount = f.amount;
          f.token_name = f.name;
        });

        this.lstBalanceAcount = this.currentAccountDetail?.balances;
        this.dataSourceToken = new MatTableDataSource(this.currentAccountDetail?.balances);
        this.pageDataToken.length = this.currentAccountDetail?.balances?.length;
        this.dataSourceTokenBk = this.dataSourceToken;

        this.dataSourceDelegation = new MatTableDataSource(this.currentAccountDetail?.delegations);
        this.pageDataDelegation.length = this.currentAccountDetail?.delegations?.length;

        this.dataSourceUnBonding = new MatTableDataSource(this.currentAccountDetail?.unbonding_delegations);
        this.pageDataUnbonding.length = this.currentAccountDetail?.unbonding_delegations?.length;
        this.dataSourceReDelegation = new MatTableDataSource(this.currentAccountDetail?.redelegations);
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
      this.lstBalanceAcount = data;
      this.dataSourceToken = new MatTableDataSource(data);
    } else {
      this.dataSourceToken = this.dataSourceTokenBk;
    }
  }

  paginatorEmit(e): void {
    this.dataSource.paginator = e;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListTransaction();
  }

  viewQrAddress(staticDataModal: any): void {
    this.modalReference = this.modalService.open(staticDataModal, {
      keyboard: false,
      centered: true,
      windowClass: 'modal-holder',
    });
  }

  closePopup() {
    this.modalReference.close();
  }

  checkAmountValue(message: any[], txHash: string, type: string) {
    let eTransType = TRANSACTION_TYPE_ENUM;
    if (message?.length > 1) {
      return `<a class="text--primary" [routerLink]="['/transaction', ` + txHash + `]">More</a>`;
    } else if (message?.length === 0 || (message.length === 1 && !message[0]?.amount)) {
      return '-';
    } else {
      let amount = message[0]?.amount[0]?.amount;
      //check type is Delegate/Undelegate/Redelegate
      if (type === eTransType.Delegate || type === eTransType.Undelegate || type === eTransType.Redelegate) {
        amount = message[0]?.amount?.amount;
      }
      return (
        this.numberPipe.transform(balanceOf(amount), this.global.formatNumberToken) +
        `<span class=text--primary> ${this.denom} </span>`
      );
    }
  }
}
