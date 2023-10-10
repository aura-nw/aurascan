import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { AccountTxType, TabsAccountLink } from 'src/app/core/constants/account.enum';
import { DATEFORMAT, LENGTH_CHARACTER, PAGE_EVENT } from 'src/app/core/constants/common.constant';
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
  @Input() tnxTypeOrigin = [];
  @Output() filterCondition = new EventEmitter<any>();
  @Output() tabName = new EventEmitter<string>();
  @Output() lstType = new EventEmitter<any>();

  transactionLoading = false;
  currentAddress: string;
  templates: Array<TableTemplate>;
  tabsData = TabsAccountLink;
  lengthAddress = LENGTH_CHARACTER.ADDRESS;
  displayFilter = false;

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
    { matColumnDef: 'type', headerCellDef: 'Message', headerWidth: 17 },
    { matColumnDef: 'timestamp', headerCellDef: 'Time', headerWidth: 17 },
    { matColumnDef: 'fromAddress', headerCellDef: 'From', headerWidth: 24 },
    { matColumnDef: 'toAddress', headerCellDef: 'To', headerWidth: 20 },
  ];

  displayedColumns: string[];

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  nextKey = null;
  currentKey = null;
  checkAll = false;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataSourceMobile: any[];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  transactionFilter: any;
  transactionTypeKeyWord = '';
  tnxType = [];
  listTypeSelectedTemp = [];
  arrTypeFilter = [];
  currentType = AccountTxType.Sent;
  accountTxType = AccountTxType;
  isSearch = false;
  minDate;
  maxDate;
  linkToken = 'token-nft';
  typeTx = [AccountTxType.Sent, AccountTxType.Received];
  modeFilter = {
    date: 'date',
    type: 'type',
    msgType: 'msgType',
    all: 'all',
  };
  isSearchOther = false;
  countFilter = 0;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinInfo = this.environmentService.configValue.chain_info.currencies[0];

  constructor(
    public global: Globals,
    private environmentService: EnvironmentService,
    public commonService: CommonService,
    private userService: UserService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initTnxFilter();
    if (this.tnxTypeOrigin?.length === 0) {
      this.getListTypeFilter();
    } else {
      this.tnxType = this.tnxTypeOrigin;
      this.tnxTypeOrigin = [...this.tnxType];
      this.lstType.emit(this.tnxTypeOrigin);
    }

    this.route.queryParams.subscribe((params) => {
      if (params?.type) {
        this.currentType = params.type || AccountTxType.Sent;
      }
    });

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
    this.listTypeSelectedTemp = [];
    this.checkAll = false;
    this.transactionFilter = {
      startDate: null,
      endDate: null,
      type: null,
      typeTransfer: null,
    };
    this.minDate = new Date(2023, 2, 20);
    this.maxDate = new Date().toISOString().slice(0, 10);
  }

  onChangeTnxFilterType(event, type: any) {
    if (type === 'all') {
      if (event.target.checked) {
        this.checkAll = true;
        this.listTypeSelectedTemp = [...this.tnxTypeOrigin];
      } else {
        this.listTypeSelectedTemp = [];
        this.checkAll = false;
      }
    } else {
      this.checkAll = false;
      if (event.target.checked) {
        this.arrTypeFilter.push(type.label);
        this.listTypeSelectedTemp?.push(type);
        if (this.listTypeSelectedTemp?.length === this.tnxTypeOrigin?.length) {
          this.checkAll = true;
        }
      } else {
        this.listTypeSelectedTemp?.forEach((element, index) => {
          if (element.label === type.label) {
            this.listTypeSelectedTemp?.splice(index, 1);
          }
        });
      }
    }
  }

  removeFilterType(type: any) {
    this.checkAll = false;
    this.listTypeSelectedTemp?.forEach((element, index) => {
      if (element.label === type.label) this.listTypeSelectedTemp?.splice(index, 1);
    });
  }

  searchTransactionType() {
    if (
      this.transactionTypeKeyWord?.toLowerCase().trim().length === 0 ||
      this.transactionTypeKeyWord?.toLowerCase().trim() === ''
    ) {
      this.tnxType = this.tnxTypeOrigin;
    } else {
      this.tnxType = this.tnxTypeOrigin?.filter(
        (k) => k.value.toLowerCase().indexOf(this.transactionTypeKeyWord?.toLowerCase().trim()) > -1,
      );
    }
  }

  changeTypeFilter(type) {
    this.transactionFilter.typeTransfer = type;
    if (document.getElementById('typeAction')?.classList.contains('show')) {
      document.getElementById('typeAction')?.classList.remove('show');
    }
    if (document.getElementById('typeActionBtn')?.classList.contains('show')) {
      document.getElementById('typeActionBtn')?.classList.remove('show');
    }
    this.searchType();
  }

  clearFilterSearch(isResetFilter = true) {
    this.tnxType = this.tnxTypeOrigin;
    this.getListTypeFilter();
    this.transactionTypeKeyWord = '';
    if (isResetFilter) {
      this.transactionFilter.type = [];
      this.listTypeSelectedTemp = [];
    }
  }

  searchType(isSearch = true) {
    this.setFilterNum();
    this.transactionLoading = true;
    this.dataSource = new MatTableDataSource();
    this.pageData.length = 0;
    this.pageData.pageIndex = 0;
    this.nextKey = null;
    this.currentKey = null;
    this.isSearch = isSearch;
    this.filterCondition.emit(this.transactionFilter);
    this.tabName.emit(this.modeQuery);
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
    let startDate = null;
    let endDate = null;

    if (this.transactionFilter.startDate && this.transactionFilter.endDate) {
      startDate = this.getConvertDate(this.transactionFilter.startDate);
      endDate = this.getConvertDate(this.transactionFilter.endDate, true);
    }

    let payload = {
      limit: 100,
      address: address,
      heightLT: nextKey,
      compositeKey: null,
      listTxMsgType: null,
      startTime: startDate || null,
      endTime: endDate || null,
    };

    if (this.isSearchOther) {
      const isSameType = (listIn, listNotIn) => listIn?.label === listNotIn;
      const onlyInLeft = (left, right, compareFunction) =>
        left.filter((leftValue) => !right.some((rightValue) => compareFunction(leftValue, rightValue)));
      const lstTemp = onlyInLeft(this.tnxTypeOrigin, this.transactionFilter.type, isSameType);
      let result = [];
      lstTemp.forEach((element) => {
        result.push(element.label);
      });
      payload['listTxMsgTypeNotIn'] = result || null;
    } else {
      payload['listTxMsgType'] = this.transactionFilter.type || null;
    }

    switch (this.modeQuery) {
      case TabsAccountLink.ExecutedTxs:
        payload.compositeKey = 'message.sender';
        this.templates = this.templatesExecute;
        this.displayedColumns = this.templatesExecute.map((dta) => dta.matColumnDef);
        this.getListTxByAddress(payload);
        break;
      case TabsAccountLink.AuraTxs:
        payload.compositeKey = ['transfer.sender', 'transfer.recipient'];
        if (this.transactionFilter.typeTransfer) {
          if (this.transactionFilter.typeTransfer === AccountTxType.Sent) {
            payload.compositeKey = ['transfer.sender'];
          } else if (this.transactionFilter.typeTransfer === AccountTxType.Received) {
            payload.compositeKey = ['transfer.recipient'];
          }
        }
        this.templates = [...this.templatesToken];
        this.templates.push({ matColumnDef: 'amount', headerCellDef: 'Amount', headerWidth: 17 });
        this.displayedColumns = this.templates.map((dta) => dta.matColumnDef);
        this.getListTxAuraByAddress(payload);
        break;
      case TabsAccountLink.FtsTxs:
        payload['sender'] = payload['receiver'] = address;
        if (this.transactionFilter.typeTransfer) {
          if (this.transactionFilter.typeTransfer === AccountTxType.Sent) {
            payload['receiver'] = '';
          } else if (this.transactionFilter.typeTransfer === AccountTxType.Received) {
            payload['sender'] = '';
          }
        }
        this.templates = [...this.templatesToken];
        this.templates.push({ matColumnDef: 'amount', headerCellDef: 'Amount', headerWidth: 17 });
        this.displayedColumns = this.templates.map((dta) => dta.matColumnDef);
        this.getListFTByAddress(payload);
        break;
      case TabsAccountLink.NftTxs:
        payload['sender'] = payload['receiver'] = address;
        payload['isCw721'] = true;
        if (this.transactionFilter.typeTransfer) {
          if (this.transactionFilter.typeTransfer === AccountTxType.Sent) {
            payload['receiver'] = '';
          } else if (this.transactionFilter.typeTransfer === AccountTxType.Received) {
            payload['sender'] = '';
          }
        }
        this.templates = [...this.templatesToken];
        this.templates.push({ matColumnDef: 'nft', headerCellDef: 'NFT', headerWidth: 15 });
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
      this.tnxType.push({ label: 'Others', value: 'Others' });
      this.tnxTypeOrigin = [...this.tnxType];
      this.lstType.emit(this.tnxTypeOrigin);
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
      this.nextKey = null;
      if (data?.transaction?.length >= 100) {
        this.nextKey = data?.transaction[data?.transaction?.length - 1]?.height;
      }

      let setReceive = false;
      if (this.modeQuery !== TabsAccountLink.ExecutedTxs && this.currentType !== AccountTxType.Sent) {
        setReceive = true;
      }

      const coinConfig = this.environmentService.configValue.coins;
      let txs = convertDataAccountTransaction(
        data,
        this.coinInfo,
        this.modeQuery,
        setReceive,
        this.currentAddress,
        coinConfig,
      );

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

  executeFilterType() {
    let lstTemp = [];
    if (this.listTypeSelectedTemp?.length > 0) {
      this.listTypeSelectedTemp?.forEach((element, index) => {
        if (element.label === 'Others') {
          this.isSearchOther = true;
        }
        lstTemp.push(element.label);
      });
    }
    this.transactionFilter.type = lstTemp || null;
    this.searchType();
  }

  clearFilterType() {
    this.transactionFilter.type = null;
    this.tnxType = this.tnxTypeOrigin;
    this.getListTypeFilter();
    this.transactionTypeKeyWord = '';
    this.listTypeSelectedTemp = [];
    this.checkAll = false;
    this.transactionFilter = {
      startDate: null,
      endDate: null,
      type: null,
      typeTransfer: null,
    };
  }

  checkedTnx(type: any) {
    let result = false;
    if (this.listTypeSelectedTemp?.length > 0 && this.listTypeSelectedTemp.find((k) => k.label === type.label)) {
      result = true;
    }
    return result;
  }

  clearFilter(mode = this.modeFilter.date) {
    if (mode === this.modeFilter.type || mode === this.modeFilter.all) {
      this.transactionFilter.typeTransfer = null;
    }
    if (mode === this.modeFilter.msgType || mode === this.modeFilter.all) {
      this.transactionFilter.type = null;
      this.listTypeSelectedTemp = [];
      this.checkAll = false;
      this.isSearchOther = false;
      this.getListTypeFilter();
      this.transactionTypeKeyWord = null;
    }
    if (mode === this.modeFilter.date || mode === this.modeFilter.all) {
      this.transactionFilter.startDate = null;
      this.transactionFilter.endDate = null;
    }
    this.searchType();
  }

  setFilterNum() {
    this.countFilter =
      +(this.transactionFilter.type?.length || 0) +
      +(this.transactionFilter.typeTransfer ? 1 : 0) +
      +(this.transactionFilter.endDate ? 1 : 0);
  }

  datePickerClickTrigger() {
    const toggle = document.getElementById('datepicker-toggle');
    if (toggle) {
      const btn = toggle.children[0];
      if (btn instanceof HTMLElement) btn.click();
    }
  }

  resetMsgTypeCheckbox() {
    this.listTypeSelectedTemp = [];
  }

  initTnxFilterPanel() {
    if (this.transactionFilter.type) {
      this.listTypeSelectedTemp = this.tnxTypeOrigin?.filter((type) =>
        this.transactionFilter?.type?.includes(type.label),
      );
      if (this.listTypeSelectedTemp?.length === this.tnxTypeOrigin?.length) {
        this.checkAll = true;
      }
    } else {
      this.checkAll = false;
      this.listTypeSelectedTemp = [];
    }
  }

  pageChangeRecord(event) {
    this.transactionLoading = true;
    this.nextKey = null;
    this.currentKey = null;
    this.pageData.pageSize = event;
    this.dataSource = new MatTableDataSource();
    this.getTxsAddress(this.nextKey);
  }

  linkExportPage() {
    localStorage.setItem('setDataExport', JSON.stringify({ address: this.currentAddress, exportType: this.modeQuery }));
    this.router.navigate(['/export-csv']);
  }
}
