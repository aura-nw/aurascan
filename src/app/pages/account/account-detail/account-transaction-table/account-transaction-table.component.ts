import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { TabsAccount } from 'src/app/core/constants/account.enum';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { UserService } from 'src/app/core/services/user.service';
import { Globals, convertDataAccountTransaction } from 'src/app/global/global';

@Component({
  selector: 'app-account-transaction-table',
  templateUrl: './account-transaction-table.component.html',
  styleUrls: ['./account-transaction-table.component.scss'],
})
export class AccountTransactionTableComponent {
  @Input() address: string;
  @Input() modeQuery: string;
  @Input() displayType: boolean = false;

  transactionLoading = false;
  currentAddress: string;
  tokenFilter = '';
  textSearch = '';
  searchValue = '';
  templates: Array<TableTemplate>;

  templatesExecute: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'fee', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
  ];

  templatesFT: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'fromAddress', headerCellDef: 'From' },
    { matColumnDef: 'toAddress', headerCellDef: 'To' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
  ];

  displayedColumns: string[];

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 5,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  nextKey = null;
  currentKey = null;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataSourceMobile: any[];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  assetsLoading = true;
  total = 0;
  dataTable = [];
  transactionFilter: any;
  transactionTypeKeyWord = '';
  tnxType = [];
  tnxTypeOrigin = [];
  listTypeSelected = '';
  isSent = true;
  isSearch = false;

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMiniDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  coinInfo = this.environmentService.configValue.chain_info.currencies[0];
  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoAura = this.image_s3 + 'images/icons/aura.svg';

  constructor(
    public global: Globals,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    public commonService: CommonService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initTnxFilter();
    this.getListTypeFilter();
    this.route.params.subscribe((params) => {
      if (params?.address) {
        this.currentAddress = params?.address;
        this.transactionLoading = true;

        this.dataSource = new MatTableDataSource();
        this.getTxsAddress();
      }
    });
  }

  initTnxFilter() {
    this.transactionTypeKeyWord = '';
    this.listTypeSelected = '';
    this.transactionFilter = {
      startDate: null,
      endDate: null,
      type: [],
    };
  }

  onChangeTnxFilterType(event, type: any) {
    if (event.target.checked) {
      if (type === 'all') {
        this.transactionFilter.type = null;
      } else {
        this.transactionFilter.type.push(type.label);
        if (!this.listTypeSelected) {
          this.listTypeSelected = type.value;
        } else {
          this.listTypeSelected += ', ' + type.value;
        }
      }
    } else {
      this.listTypeSelected = this.listTypeSelected?.replace(', ' + type?.value, '').replace(type?.value, '');
      if (type === 'all') {
        this.transactionFilter.type = [];
      } else {
        this.transactionFilter.type.forEach((element, index) => {
          if (element === type.label) {
            this.transactionFilter.type.splice(index, 1);
          }
        });
      }
    }
  }

  searchTransactionType() {
    this.tnxType = this.tnxType.filter(
      (k) => k.value.toLowerCase().indexOf(this.transactionTypeKeyWord.toLowerCase().trim()) > -1,
    );
  }

  clearFilterSearch() {
    this.tnxType = this.tnxTypeOrigin;
    this.transactionTypeKeyWord = '';
    this.listTypeSelected = '';
  }

  searchType() {
    this.transactionLoading = true;
    this.dataSource = new MatTableDataSource();
    this.pageData.length = 0;
    this.nextKey = null;
    this.isSearch = true;
    this.getTxsAddress();
  }

  getTxsAddress(nextKey = null): void {
    const address = this.currentAddress;
    let payload = {
      limit: 100,
      address: address,
      heightLT: nextKey,
      compositeKey: null,
      listTxMsgType: null,
    };

    if (this.transactionFilter?.type?.length > 0) {
      payload.listTxMsgType = this.transactionFilter?.type;
    }

    switch (this.modeQuery) {
      case TabsAccount.ExecutedTxs:
        payload.compositeKey = 'message.sender';
        this.templates = this.templatesExecute;
        this.displayedColumns = this.templatesExecute.map((dta) => dta.matColumnDef);
        this.getListTxByAddress(payload);
        break;
      case TabsAccount.AuraTxs:
        payload.compositeKey = 'coin_spent.spender';
        if (!this.isSent) {
          payload.compositeKey = 'coin_received.receiver';
        }
        this.templates = this.templatesExecute;
        this.displayedColumns = this.templatesExecute.map((dta) => dta.matColumnDef);
        this.getListTxByAddress(payload);
        break;
      case TabsAccount.FtsTxs:
        this.templates = this.templatesExecute;
        this.displayedColumns = this.templatesFT.map((dta) => dta.matColumnDef);
        this.getListFTByAddress(payload);
        break;
      default:
        break;
    }
  }

  getListTypeFilter() {
    this.userService.getListTypeFilter().subscribe((res) => {
      this.tnxType = res?.transaction_message?.map((element) => {
        let type = _.find(TYPE_TRANSACTION, { label: element?.type })?.value;
        const obj = { label: element?.type, value: type };
        return obj;
      });
      this.tnxType = this.tnxType?.filter((k) => k.value);
      this.tnxTypeOrigin = [...this.tnxType];
    });
  }

  getListTxByAddress(payload) {
    this.userService.getListTxByAddress(payload).subscribe({
      next: (data) => {
        if (data?.transaction?.length > 0) {
          if (data?.transaction?.length >= 100) {
            this.nextKey = data?.transaction[data?.transaction?.length - 1]?.height;
          }

          let setReceive = false;
          if (this.modeQuery !== TabsAccount.ExecutedTxs && !this.isSent) {
            setReceive = true;
          }

          let txs = convertDataAccountTransaction(data, this.coinInfo, setReceive);

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

  getListFTByAddress(payload) {
    this.userService.getListFTByAddress(payload).subscribe({
      next: (data) => {
        // if (data?.transaction?.length > 0) {
        //   this.nextKey = data?.transaction[data?.transaction?.length - 1]?.height;
        //   if (data?.transaction?.length >= 100) {
        //     this.hasNextKey.emit(true);
        //   } else {
        //     this.hasNextKey.emit(false);
        //   }

        //   let setReceive = false;
        //   if (this.modeQuery !== TabsAccount.ExecutedTxs && !this.isTypeSend) {
        //     setReceive = true;
        //   }

        //   let txs = convertDataAccountTransaction(data, this.coinInfo, setReceive);

        //   if (this.dataSource.data.length > 0) {
        //     this.dataSource.data = [...this.dataSource.data, ...txs];
        //   } else {
        //     this.dataSource.data = [...txs];
        //   }

        //   this.dataSourceMobile = this.dataSource.data.slice(
        //     this.pageData.pageIndex * this.pageData.pageSize,
        //     this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
        //   );

        //   this.pageData.length = this.dataSource.data.length;
        //   this.lengthData.emit(this.pageData.length);
        // }
      },
      error: () => {
        this.transactionLoading = false;
      },
      complete: () => {
        this.transactionLoading = false;
      },
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
      this.getTxsAddress(this.nextKey);
      this.currentKey = this.nextKey;
    }
  }
}
