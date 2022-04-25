import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartComponent } from 'ng-apexcharts';
import * as qrCode from 'qrcode';
import { CommonService } from '../../../app/core/services/common.service';
import { ACCOUNT_WALLET_COLOR, TYPE_ACCOUNT } from '../../../app/core/constants/account.constant';
import {
  ACCOUNT_TYPE_ENUM,
  ACCOUNT_WALLET_COLOR_ENUM,
  PageEventType,
  WalletAcount,
} from '../../../app/core/constants/account.enum';
import { PAGE_EVENT } from '../../../app/core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../app/core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction, TypeTransaction } from '../../../app/core/constants/transaction.enum';
import { ResponseDto, TableTemplate } from '../../../app/core/models/common.model';
import { AccountService } from '../../../app/core/services/account.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { getAmount, Globals } from '../../../app/global/global';
import { IAccountDetail } from '../../core/models/account.model';
import { chartCustomOptions, ChartOptions, CHART_OPTION } from './chart-options';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('assetTypeSelect') assetTypeSelect;
  @HostListener('window:scroll', ['$event'])
  closeOptionPanelSection(event) {
    if (this.assetTypeSelect !== undefined) {
      this.assetTypeSelect.close();
    }
  }
  public chartOptions: Partial<ChartOptions>;

  @ViewChild('walletChart') chart: ChartComponent;
  @ViewChild(MatSort) sort: MatSort;

  breadCrumbItems!: Array<{}>;
  
  currentAddress: string;

  currentAccountDetail: IAccountDetail;
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash_format', headerCellDef: 'Tx Hash' },
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
  pageType = '';

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
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

  length;
  pageSize = 5;
  pageIndex = 0;
  typeTransaction = TYPE_TRANSACTION;
  statusTransaction = StatusTransaction;
  pageEventType = PageEventType;
  imgGenerateQR: boolean;
  assetsType = TYPE_ACCOUNT;
  isCopy = false;
  tokenPrice = 0;
  selected = ACCOUNT_TYPE_ENUM.All;
  searchNullData = false;
  chartCustomOptions = chartCustomOptions;

  constructor(
    private transactionService: TransactionService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    public global: Globals,
  ) {
    this.chartOptions = CHART_OPTION();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.chartCustomOptions = [...ACCOUNT_WALLET_COLOR];
    // this.breadCrumbItems = [{ label: 'Account' }, { label: 'Detail', active: true }];
    // this.id = this.route.snapshot.paramMap.get('id');
    this.route.params.subscribe((params) => {
      if (params?.id) {
        this.currentAddress = params?.id;
        this.getAccountDetail();
        this.getListTransaction();
      } else {
      }
    });
  }

  copyMessage(val: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.isCopy = true;
    setTimeout(() => {
      this.isCopy = false;
    }, 1000);
  }

  changePage(page: any): void {
    // this.dataSource = null;
    // this.pageIndex = page.pageIndex;
    switch (page.pageEventType) {
      case this.pageEventType.Delegation:
        this.pageDataDelegation.pageIndex = page.pageIndex;
        this.getListTransaction();
        break;
      case this.pageEventType.Unbonding:
        this.pageDataUnbonding.pageIndex = page.pageIndex;
        // this.getListDelegators();
        break;
      case this.pageEventType.Redelegation:
        this.pageDataRedelegation.pageIndex = page.pageIndex;
        // this.getListPower();
        break;
      case this.pageEventType.Vestings:
        this.pageDataVesting.pageIndex = page.pageIndex;
        // this.getListPower();
        break;
      case this.pageEventType.Token:
        this.pageDataToken.pageIndex = page.pageIndex;
        // this.getListPower();
        break;
      default:
        this.pageData.pageIndex = page.pageIndex;
        this.getListTransaction();
        break;
    }
  }

  getListTransaction(): void {
    this.transactionService
      .txsWithAddress(this.pageSize, this.pageData.pageIndex * this.pageSize, this.currentAddress)
      .subscribe((res: ResponseDto) => {
        res.data.forEach((trans) => {
          //get amount of transaction
          trans.amount = getAmount(trans.messages, trans.type, trans.raw_log);
          const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === trans.type.toLowerCase());
          trans.type = typeTrans?.value;
          trans.status = StatusTransaction.Fail;
          if (trans.code === CodeTransaction.Success) {
            trans.status = StatusTransaction.Success;
          }
          if (trans.type === TypeTransaction.Send && trans?.messages[0]?.from_address !== this.currentAddress) {
            trans.type = TypeTransaction.Received;
          }
          trans.tx_hash_format = trans.tx_hash.replace(trans.tx_hash.substring(6, trans.tx_hash.length - 6), '...');
        });

        this.dataSource.data =  res.data ;// new MatTableDataSource(res.data);
        
        this.length = res.meta.count;
        // this.pageData.length= 
        this.pageData.length = res.meta.count;
      });
  }

  getAccountDetail(): void {
    this.accountService.getAccoutDetail(this.currentAddress).subscribe((res) => {
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
            f.amount = this.currentAccountDetail.vesting?.amount;
            break;
          default:
            break;
        }
        f.amount = f.amount || '0';
        this.chartOptions.series.push(Number(f.amount));
      });

      this.currentAccountDetail.balances.forEach((token) => {
        token.price = 0;
        if (token.name === this.global.stableToken) {
          token.amount = this.currentAccountDetail.total;
        }
        token.total_value = token.price * Number(token.amount);
        // token.total_price = token.price * Number(token.amount);
      });
      this.tokenPrice = 0;

      this.currentAccountDetail?.balances.forEach((f) => {
        f.token_amount = f.amount;
        f.token_name = f.name;
      });

      this.dataSourceToken = new MatTableDataSource(this.currentAccountDetail?.balances);
      this.pageDataToken.length = this.currentAccountDetail?.balances.length;
      this.dataSourceTokenBk = this.dataSourceToken;

      this.dataSourceDelegation = new MatTableDataSource(this.currentAccountDetail?.delegations);
      this.pageDataDelegation.length = this.currentAccountDetail?.delegations.length;

      this.dataSourceUnBonding = new MatTableDataSource(this.currentAccountDetail?.unbonding_delegations);
      this.pageDataUnbonding.length = this.currentAccountDetail?.unbonding_delegations.length;

      this.dataSourceReDelegation = new MatTableDataSource(this.currentAccountDetail?.redelegations);
      this.pageDataRedelegation.length = this.currentAccountDetail?.redelegations.length;

      if (this.currentAccountDetail?.vesting) {
        this.dataSourceVesting = new MatTableDataSource([this.currentAccountDetail?.vesting]);
        this.pageDataVesting.length = 1;
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

  openTxsDetail(event: any, data: any) {
    const linkHash = event?.target.classList.contains('hash-link');
    const linkBlock = event?.target.classList.contains('block-link');
    if (linkHash) {
      this.router.navigate(['transaction', data.tx_hash]);
    } else if (linkBlock) {
      this.router.navigate(['blocks/id', data.blockId]);
    }
  }

  paginatorEmit(e): void {
    this.dataSource.paginator = e;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListTransaction();
  }
}
