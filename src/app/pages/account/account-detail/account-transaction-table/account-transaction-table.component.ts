import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TabsAccount } from 'src/app/core/constants/account.enum';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { AccountService } from 'src/app/core/services/account.service';
import { CommonService } from 'src/app/core/services/common.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { UserService } from 'src/app/core/services/user.service';
import { Globals, convertDataAccountTransaction } from 'src/app/global/global';

@Component({
  selector: 'app-account-transaction-table',
  templateUrl: './account-transaction-table.component.html',
  styleUrls: ['./account-transaction-table.component.scss'],
})
export class AccountTransactionTableComponent implements OnChanges {
  @Input() address: string;
  @Input() modeQuery: string;
  @Input() isTypeSend: boolean = true;
  @Output() lengthData = new EventEmitter<number>();
  @Output() hasNextKey = new EventEmitter<boolean>();

  transactionLoading = false;
  currentAddress: string;
  tokenFilter = '';
  textSearch = '';
  searchValue = '';
  templates: Array<TableTemplate>;

  templatesExecute: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'lstType', headerCellDef: 'Type' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'fee', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
  ];

  listTokenType = [
    {
      label: 'All',
      value: '',
      quantity: 0,
    },
    {
      label: 'Native Coin',
      value: 'native',
      quantity: 0,
    },
    {
      label: 'IBC Token',
      value: 'ibc',
      quantity: 0,
    },
    {
      label: 'CW-20 Token',
      value: 'cw20',
      quantity: 0,
    },
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
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMiniDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  coinInfo = this.environmentService.configValue.chain_info.currencies[0];
  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoAura = this.image_s3 + 'images/icons/aura.svg';

  constructor(
    public global: Globals,
    private accountService: AccountService,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    public commonService: CommonService,
    private transactionService: TransactionService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params?.address) {
        this.currentAddress = params?.address;
        this.transactionLoading = true;

        this.dataSource = new MatTableDataSource();
        this.getTxsAddress();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isTypeSend) {
      this.transactionLoading = true;
      this.dataSource = new MatTableDataSource();
      this.pageData.length = 0;
      this.lengthData.emit(this.pageData.length);
      this.getTxsAddress();
    }
  }

  getTxsAddress(nextKey = null): void {
    const address = this.currentAddress;
    let payload = {
      limit: 100,
      address: address,
      heightLT: nextKey,
      compositeKey: 'message.sender',
    };

    switch (this.modeQuery) {
      case TabsAccount.ExecutedTxs:
        this.templates = this.templatesExecute;
        this.displayedColumns = this.templatesExecute.map((dta) => dta.matColumnDef);
        break;
      case TabsAccount.AuraTxs:
        payload.compositeKey = 'coin_spent.spender' || 'coin_received.receiver';
        if (!this.isTypeSend) {
          payload.compositeKey = 'coin_received.receiver';
        }
        this.templates = this.templatesExecute;
        this.displayedColumns = this.templatesExecute.map((dta) => dta.matColumnDef);
        break;
      default:
        break;
    }

    this.userService.getListTxByAddress(payload).subscribe({
      next: (data) => {
        if (data?.transaction?.length > 0) {
          this.nextKey = data?.transaction[data?.transaction?.length - 1]?.height;
          if (data?.transaction?.length >= 100) {
            this.hasNextKey.emit(true);
          } else {
            this.hasNextKey.emit(false);
          }

          let setReceive = false;
          if (this.modeQuery !== TabsAccount.ExecutedTxs && !this.isTypeSend) {
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
          this.lengthData.emit(this.pageData.length);
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
