import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ADDRESS_PREFIX, PAGE_EVENT } from '../../../../../../core/constants/common.constant';
import { TokenTab } from '../../../../../../core/constants/token.enum';
import { TYPE_TRANSACTION } from '../../../../../../core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction } from '../../../../../../core/constants/transaction.enum';
import { TableTemplate } from '../../../../../../core/models/common.model';
import { CommonService } from '../../../../../../core/services/common.service';
import { TokenService } from '../../../../../../core/services/token.service';
import { shortenAddress } from '../../../../../../core/utils/common/shorten';
import { Globals } from '../../../../../../global/global';

interface CustomPageEvent {
  next: number;
  type: string;
}

@Component({
  selector: 'app-token-transfers-tab',
  templateUrl: './token-transfers-tab.component.html',
  styleUrls: ['./token-transfers-tab.component.scss'],
})
export class TokenTransfersTabComponent implements OnInit, OnChanges {
  @Input() type: 'TABLE_TOKEN' | 'TABLE_ADDRESS';
  @Input() keyWord = '';
  tokenDataList: any[];
  length: number;
  @Output() loadMore = new EventEmitter<CustomPageEvent>();
  @Output() resultLength = new EventEmitter<any>();

  tokenTransferTemplates: Array<TableTemplate> = [
    { matColumnDef: 'action', headerCellDef: '' },
    { matColumnDef: 'tx_hash', headerCellDef: 'Txn Hash', isShort: true },
    { matColumnDef: 'type', headerCellDef: 'Method', isShort: true },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'from_address', headerCellDef: 'From' },
    { matColumnDef: 'to_address', headerCellDef: 'To' },
    { matColumnDef: 'amount', headerCellDef: 'Amount', isShort: true },
  ];

  displayedColumns: string[];
  template: Array<TableTemplate> = [];

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  loading = true;
  token: string = '';
  typeTransaction = TYPE_TRANSACTION;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  codeTransaction = CodeTransaction;
  tokenDetail = undefined;
  tokenType = 'Aura';
  tokenAddress = '0xb8c77482e45f1f44de1745f52c74426c631bdd52';
  isSearchAddress = false;

  constructor(public global: Globals, public commonService: CommonService, private tokenService: TokenService) {}

  ngOnInit(): void {
    this.getDataTable();
    this.template = this.getTemplate(this.type);
    this.displayedColumns = this.getTemplate(this.type).map((template) => template.matColumnDef);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.tokenDataList) {
      this.isSearchAddress = false;

      const filterData = this.tokenDataList.filter(
        (data) =>
          data.tx_hash.includes(this.keyWord) ||
          data.from_address.includes(this.keyWord) ||
          data.to_address.includes(this.keyWord),
      );
      if (filterData.length > 0) {
        this.pageData.length = filterData.length;
        if (this.keyWord?.length >= 43 && this.keyWord?.startsWith(ADDRESS_PREFIX)) {
          this.isSearchAddress = true;
        }
        this.dataSource = new MatTableDataSource<any>(filterData);
      }
      this.resultLength.emit(filterData.length);
    }
  }

  getDataTable(): void {
    this.tokenService.getListTokenTransfer(this.token).subscribe((res) => {
      this.loading = true;
      if (res && res.length > 0) {
        this.tokenDataList = [...res];
        this.tokenDataList.forEach((token) => {
          token.status = StatusTransaction.Fail;
          if (token?.code == CodeTransaction.Success) {
            token.status = StatusTransaction.Success;
          }
          token.price = token.amount * 1;
          const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === token.type.toLowerCase());
          token.type = typeTrans?.value;
        });

        this.dataSource = new MatTableDataSource(this.tokenDataList);
        this.pageData.length = res.length;
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
