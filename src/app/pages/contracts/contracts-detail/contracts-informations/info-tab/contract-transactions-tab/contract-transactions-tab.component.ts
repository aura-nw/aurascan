import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TYPE_TRANSACTION } from '../../../../../../core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction } from '../../../../../../core/constants/transaction.enum';
import { TableTemplate } from '../../../../../../core/models/common.model';
import { CommonService } from '../../../../../../core/services/common.service';
import { ContractService } from '../../../../../../core/services/contract.service';
import { shortenAddress } from '../../../../../../core/utils/common/shorten';
import { Globals } from '../../../../../../global/global';

interface CustomPageEvent {
  next: number;
  type: string;
}

@Component({
  selector: 'app-contract-transactions-tab',
  templateUrl: './contract-transactions-tab.component.html',
  styleUrls: ['./contract-transactions-tab.component.scss'],
})
export class ContractTransactionsTabComponent implements OnInit {
  @Input() type: 'TABLE_TOKEN' | 'TABLE_ADDRESS';
  @Output() loadMore = new EventEmitter<CustomPageEvent>();

  tokenTransferTemplates: Array<TableTemplate> = [
    { matColumnDef: 'action', headerCellDef: '' },
    { matColumnDef: 'tx_hash_format', headerCellDef: 'Txn Hash', isShort: true },
    { matColumnDef: 'type', headerCellDef: 'Method', isShort: true },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'from_address_format', headerCellDef: 'From' },
    { matColumnDef: 'to_address_format', headerCellDef: 'To' },
    { matColumnDef: 'amount', headerCellDef: 'Amount', isShort: true },
  ];

  displayedColumns: string[];
  template: Array<TableTemplate> = [];
  tokenDataList: any[];

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  loading = true;
  token: string = '';
  typeTransaction = TYPE_TRANSACTION;
  pageData: PageEvent;
  pageSize = 10;
  pageIndex = 0;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  codeTransaction = CodeTransaction;
  tokenDetail = undefined;
  tokenType = 'Aura';
  tokenAddress = '0xb8c77482e45f1f44de1745f52c74426c631bdd52';
  isSearchAddres = false;

  constructor(
    public global: Globals,
    private layout: BreakpointObserver,
    public commonService: CommonService,
    private contractService: ContractService,
  ) {}

  ngOnInit(): void {
    this.getDataTable();
    this.template = this.getTemplate(this.type);
    this.displayedColumns = this.getTemplate(this.type).map((template) => template.matColumnDef);
  }

  getDataTable(): void {
    this.contractService.getListTransaction(this.token).subscribe((res) => {
      this.loading = true;
      if (res && res.length > 0) {
        this.tokenDataList = [...res];
        this.tokenDataList.forEach((token) => {
          token.status = StatusTransaction.Fail;
          if (token?.code == CodeTransaction.Success) {
            token.status = StatusTransaction.Success;
          }
          token.tx_hash_format = token.tx_hash.replace(token.tx_hash.substring(20), '...');
          token.from_address_format = token.from_address.replace(token.from_address.substring(20), '...');
          token.to_address_format = token.to_address.replace(token.to_address.substring(20), '...');
          token.price = token.amount * 0.5;
          const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === token.type.toLowerCase());
          token.type = typeTrans?.value;
        });

        this.dataSource = new MatTableDataSource(this.tokenDataList);
        this.pageData = {
          length: res.length,
          pageSize: 10,
          pageIndex: 1,
        };
      }
      this.loading = false;
    });
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
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

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
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
}
