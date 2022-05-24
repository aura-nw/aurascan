import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TableTemplate } from '../../../../../../core/models/common.model';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TokenTab } from '../../../../../../core/constants/smart-contract.enum';
import { Globals } from '../../../../../../global/global';
import { CommonService } from '../../../../../../core/services/common.service';
import { PageEvent } from '@angular/material/paginator';
import { shortenAddress } from 'src/app/core/utils/common/shorten';
import { SmartContractService } from '../../../../../../core/services/smart-contract.service';
import { TYPE_TRANSACTION } from '../../../../../../core/constants/transaction.constant';
import { CodeTransaction } from 'src/app/core/constants/transaction.enum';

interface CustomPageEvent {
  next: number;
  type: string;
}

@Component({
  selector: 'app-transfers',
  templateUrl: './transfers.component.html',
  styleUrls: ['./transfers.component.scss'],
})
export class TransfersComponent implements OnInit, OnChanges {
  @Input() type: 'TABLE_TOKEN' | 'TABLE_ADDRESS';
  @Input() keyWord = '';
  tokenDataList: any[];
  length: number;
  @Output() loadMore = new EventEmitter<CustomPageEvent>();
  @Output() resultLength = new EventEmitter<any>();

  tokenTransferTemplates: Array<TableTemplate> = [
    { matColumnDef: 'action', headerCellDef: '' },
    { matColumnDef: 'tx_hash', headerCellDef: 'Txn Hash', isUrl: '/transaction', isShort: true },
    { matColumnDef: 'type', headerCellDef: 'Method', isShort: true },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'from_address', headerCellDef: 'From', isUrl: '/account' },
    { matColumnDef: 'to_address', headerCellDef: 'To', isUrl: '/account' },
    { matColumnDef: 'amount', headerCellDef: 'Amount', isShort: true },
  ];

  displayedColumns: string[];
  template: Array<TableTemplate> = [];

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  typeTokenTab = TokenTab;
  loading = true;
  token: string = '';
  typeTransaction = TYPE_TRANSACTION;
  pageData: PageEvent;
  pageSize = 5;
  pageIndex = 0;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  codeTransaction = CodeTransaction;
  tokenDetail = undefined;
  tokenType = 'Aura';
  tokenAddress = '0xb8c77482e45f1f44de1745f52c74426c631bdd52';

  constructor(
    public global: Globals,
    public commonService: CommonService,
    private smartContractService: SmartContractService,
    private layout: BreakpointObserver,
  ) // private datePipe: DatePipe
  {}

  ngOnInit(): void {
    this.getDataTable();
    this.template = this.getTemplate(this.type);
    this.displayedColumns = this.getTemplate(this.type).map((template) => template.matColumnDef);
    // this.dateFormat = this.datePipe.transform(this.item?.timestamp, DATEFORMAT.DATETIME_UTC);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.tokenDataList) {
      const filterData = this.tokenDataList.filter(
        (data) =>
          data.tx_hash.includes(this.keyWord) ||
          data.from_address.includes(this.keyWord) ||
          data.to_address.includes(this.keyWord),
      );
      if (filterData.length > 0) {
        this.pageData = {
          length: filterData.length,
          pageSize: 10,
          pageIndex: 1,
        };
        this.dataSource = new MatTableDataSource<any>(filterData);
      }
      this.resultLength.emit(filterData.length);
    }
  }

  getDataTable(): void {
    this.smartContractService.getListTokenTransfer(this.token).subscribe((res) => {
      this.loading = true;
      if (res && res.length > 0) {
        this.tokenDataList = [...res];
        this.dataSource = new MatTableDataSource(this.tokenDataList);
        this.pageData = {
          length: res.length,
          pageSize: 5,
          pageIndex: 1,
        };

        this.tokenDataList.forEach((token) => {
          // k.timestamp = this.datePipe.transform(k.timestamp, DATEFORMAT.DATETIME_UTC);
          const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === token.type.toLowerCase());
          token.type = typeTrans?.value;
        });
      }
      this.loading = false;
    });
  }

  getTemplate(type: 'TABLE_TOKEN' | 'TABLE_ADDRESS'): Array<TableTemplate> {
    switch (type) {
      case 'TABLE_TOKEN':
        return this.tokenTransferTemplates;
      case 'TABLE_ADDRESS':
      // return this.depositorsTemplates;
      default:
        return [];
    }
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }

  pageEvent(e: PageEvent): void {
    const { length, pageIndex, pageSize } = e;
    const next = length <= pageIndex * pageSize;

    if (next) {
      this.loadMore.emit({
        next: 1,
        type: this.type,
      });
    }
  }

  getListData(): any[] {
    if (!(this.dataSource?.paginator && this.dataSource?.data)) {
      return [];
    }
    return this.dataSource.data.slice(
      this.dataSource.paginator.pageIndex * this.dataSource.paginator.pageSize,
      this.dataSource.paginator.pageIndex * this.dataSource.paginator.pageSize + this.dataSource.paginator.pageSize,
    );
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  getTokenDetail(data: any): void {
    this.tokenDetail = data;
  }
}
