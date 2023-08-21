import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { AccountTxType, TabsAccount } from 'src/app/core/constants/account.enum';
import { DATEFORMAT, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { UserService } from 'src/app/core/services/user.service';
import { Globals, convertDataAccountTransaction } from 'src/app/global/global';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';

@Component({
  selector: 'app-account-transaction-table',
  templateUrl: './account-transaction-table.component.html',
  styleUrls: ['./account-transaction-table.component.scss'],
})
export class AccountTransactionTableComponent {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  @Input() address: string;
  @Input() modeQuery: string;
  @Input() displayType: boolean = false;

  transactionLoading = false;
  currentAddress: string;
  tokenFilter = '';
  textSearch = '';
  searchValue = '';
  templates: Array<TableTemplate>;
  tabsData = TabsAccount;

  templatesExecute: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash', headerWidth: 18 },
    { matColumnDef: 'type', headerCellDef: 'Message', headerWidth: 20 },
    { matColumnDef: 'status', headerCellDef: 'Result', headerWidth: 12 },
    { matColumnDef: 'timestamp', headerCellDef: 'Time', headerWidth: 15 },
    { matColumnDef: 'fee', headerCellDef: 'Fee', headerWidth: 20 },
    { matColumnDef: 'height', headerCellDef: 'Height', headerWidth: 12 },
  ];

  templatesToken: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash', headerWidth: 14 },
    { matColumnDef: 'type', headerCellDef: 'Message', headerWidth: 15 },
    { matColumnDef: 'status', headerCellDef: 'Result', headerWidth: 8 },
    { matColumnDef: 'timestamp', headerCellDef: 'Time', headerWidth: 12 },
    { matColumnDef: 'fromAddress', headerCellDef: 'From', headerWidth: 17 },
    { matColumnDef: 'toAddress', headerCellDef: 'To', headerWidth: 17 },
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
  currentType = AccountTxType.Sent;
  accountTxType = AccountTxType;
  isSearch = false;
  minDate;
  maxDate;
  linkToken = 'token-nft';
  typeTx = [AccountTxType.Sent, AccountTxType.Received];

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMiniDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  coinInfo = this.environmentService.configValue.chain_info.currencies[0];

  constructor(
    public global: Globals,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    public commonService: CommonService,
    private userService: UserService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
  ) {
    this.minDate = new Date(2023, 2, 20);
    this.maxDate = new Date().toISOString().slice(0, 10);
  }

  ngOnInit(): void {
    this.initTnxFilter();
    if (this.tnxTypeOrigin?.length === 0) {
      this.getListTypeFilter();
    }
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
        this.listTypeSelected = 'All';
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
        this.listTypeSelected = '';
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

  searchType(isSearch = true) {
    this.transactionLoading = true;
    this.dataSource = new MatTableDataSource();
    this.pageData.length = 0;
    this.pageData.pageIndex = 0;
    this.nextKey = null;
    this.isSearch = isSearch;
    this.getTxsAddress();
  }

  changeType(currentType = AccountTxType.Sent) {
    this.currentType = currentType;
    this.searchType();
  }

  getConvertDate(date, lastDate = false) {
    if (!date) {
      return null;
    }

    let temp = this.datePipe.transform(date, DATEFORMAT.DATE_ONLY);
    let subStringDate = lastDate ? 'T24:00:000Z' : 'T00:00:000Z';
    return temp + subStringDate;
  }

  getTxsAddress(nextKey = null): void {
    const address = this.currentAddress;

    let payload = {
      limit: 100,
      address: address,
      heightLT: nextKey,
      compositeKey: null,
      listTxMsgType: null,
      startTime: this.getConvertDate(this.transactionFilter.startDate) || null,
      endTime: this.getConvertDate(this.transactionFilter.endDate, true) || null,
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
        if (this.currentType !== AccountTxType.Sent) {
          payload.compositeKey = 'coin_received.receiver';
        }
        this.templates = [...this.templatesToken];
        this.templates.push({ matColumnDef: 'amount', headerCellDef: 'Amount', headerWidth: 15 });
        this.displayedColumns = this.templates.map((dta) => dta.matColumnDef);
        // this.getListTxAuraByAddress(payload);
        break;
      case TabsAccount.FtsTxs:
        if (this.currentType === AccountTxType.Sent) {
          payload['sender'] = address;
        } else {
          payload['receiver'] = address;
        }
        this.templates = [...this.templatesToken];
        this.templates.push({ matColumnDef: 'amount', headerCellDef: 'Amount', headerWidth: 17 });
        this.displayedColumns = this.templates.map((dta) => dta.matColumnDef);
        this.getListFTByAddress(payload);
        break;
      case TabsAccount.NftTxs:
        if (this.currentType === AccountTxType.Sent) {
          payload['sender'] = address;
        } else {
          payload['receiver'] = address;
        }
        this.templates = [...this.templatesToken];
        this.templates.push({ matColumnDef: 'tokenId', headerCellDef: 'Token ID', headerWidth: 17 });
        this.displayedColumns = this.templates.map((dta) => dta.matColumnDef);
        this.getListNFTByAddress(payload);
        break;
      default:
        break;
    }

    setTimeout(() => {
      this.transactionLoading = false;
    }, 5000);
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
        this.handleGetData(data);
      },
      error: () => {
        this.transactionLoading = false;
      },
      complete: () => {
        this.transactionLoading = false;
      },
    });
  }

  getListTxAuraByAddress(payload) {
    this.userService.getListTxAuraByAddress(payload).subscribe({
      next: (data) => {
        this.handleGetData(data);
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
        this.handleGetData(data);
      },
      error: () => {
        this.transactionLoading = false;
      },
      complete: () => {
        this.transactionLoading = false;
      },
    });
  }

  getListNFTByAddress(payload) {
    this.userService.getListNFTByAddress(payload).subscribe({
      next: (data) => {
        this.handleGetData(data);
      },
      error: () => {
        this.transactionLoading = false;
      },
      complete: () => {
        this.transactionLoading = false;
      },
    });
  }

  handleGetData(data) {
    if (data?.transaction?.length > 0) {
      if (data?.transaction?.length >= 100) {
        this.nextKey = data?.transaction[data?.transaction?.length - 1]?.height;
      }

      let setReceive = false;
      if (this.modeQuery !== TabsAccount.ExecutedTxs && this.currentType !== AccountTxType.Sent) {
        setReceive = true;
      }

      let txs = convertDataAccountTransaction(data, this.coinInfo, this.modeQuery, setReceive);
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
  }

  seeMoreData(data) {
    data.limit += 6;
  }

  expandData(data) {
    if (data.arrEvent?.length <= 1) {
      return;
    }
    data.limit = 6;
    data.expand = !data.expand;
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
