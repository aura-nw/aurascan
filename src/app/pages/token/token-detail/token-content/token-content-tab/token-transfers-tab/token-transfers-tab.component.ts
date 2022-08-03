import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { parseDataTransaction } from 'src/app/core/utils/common/info-common';
import { balanceOf } from 'src/app/core/utils/common/parsing';
import { ADDRESS_PREFIX, PAGE_EVENT } from '../../../../../../core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../../../../core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction } from '../../../../../../core/constants/transaction.enum';
import { TableTemplate } from '../../../../../../core/models/common.model';
import { CommonService } from '../../../../../../core/services/common.service';
import { TokenService } from '../../../../../../core/services/token.service';
import { shortenAddress } from '../../../../../../core/utils/common/shorten';
import { getAddress, getAmount, Globals } from '../../../../../../global/global';

interface CustomPageEvent {
  next: number;
  isNFTContract: boolean;
}

@Component({
  selector: 'app-token-transfers-tab',
  templateUrl: './token-transfers-tab.component.html',
  styleUrls: ['./token-transfers-tab.component.scss'],
})
export class TokenTransfersTabComponent implements OnInit, OnChanges {
  @Input() isNFTContract: boolean;
  @Input() tokenID: string;
  @Input() keyWord = '';
  tokenDataList: any[];
  length: number;
  @Output() loadMore = new EventEmitter<CustomPageEvent>();
  @Output() resultLength = new EventEmitter<any>();

  noneNFTTemplates: Array<TableTemplate> = [
    { matColumnDef: 'action', headerCellDef: '' },
    { matColumnDef: 'tx_hash', headerCellDef: 'Txn Hash', isShort: true },
    { matColumnDef: 'type', headerCellDef: 'Method', isShort: true },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'from_address', headerCellDef: 'From' },
    { matColumnDef: 'to_address', headerCellDef: 'To' },
    { matColumnDef: 'amount', headerCellDef: 'Amount', isShort: true },
  ];

  NFTTemplates: Array<TableTemplate> = [
    { matColumnDef: 'action', headerCellDef: '' },
    { matColumnDef: 'tx_hash', headerCellDef: 'Txn Hash', isShort: true },
    { matColumnDef: 'type', headerCellDef: 'Method', isShort: true },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'from_address', headerCellDef: 'From' },
    { matColumnDef: 'to_address', headerCellDef: 'To' },
    { matColumnDef: 'token_id', headerCellDef: 'TokenID' },
    { matColumnDef: 'details', headerCellDef: 'Details' },
  ];

  displayedColumns: string[];
  template: Array<TableTemplate> = [];

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  loading = true;
  typeTransaction = TYPE_TRANSACTION;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  codeTransaction = CodeTransaction;
  tokenDetail = undefined;
  tokenType = 'Aura';
  isSearchAddress = false;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  dataSearch: any;

  constructor(
    public global: Globals,
    public commonService: CommonService,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.getDataTable();
    this.template = this.getTemplate();
    this.displayedColumns = this.getTemplate().map((template) => template.matColumnDef);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.keyWord);

    // if (this.tokenDataList) {
      console.log('before:', this.dataSource.data);
    this.getDataToken(this.keyWord);
    console.log('after: ', this.dataSource.data);
    
    this.isSearchAddress = false;
    const filterData = this.tokenDataList.filter(
      (data) =>
        data.tx_hash.includes(this.keyWord) ||
        data.from_address.includes(this.keyWord) ||
        data.to_address.includes(this.keyWord) ||
        data.token_id.includes(this.keyWord),
    );
    if (filterData.length > 0) {
      this.pageData.length = filterData.length;
      if (this.keyWord?.length >= 43 && this.keyWord?.startsWith(ADDRESS_PREFIX)) {
        this.isSearchAddress = true;
      }
      this.dataSource = new MatTableDataSource<any>(filterData);
    }
    this.resultLength.emit(filterData.length);
    // }
  }

  getDataTable(): void {
    this.loading = true;
    if (this.isNFTContract) {
      this.tokenService.getListTokenNFT(this.tokenID).subscribe(
        (res) => {
          if (res && res.data.count > 0) {
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
        },
        () => {
          this.loading = false;
        },
      );
    } else {
      this.getDataToken();
    }
  }

  getDataToken(filterData = '') {
    this.tokenService
      .getListTokenTransferTemp(
        this.pageData.pageSize,
        this.pageData.pageIndex * this.pageData.pageSize,
        this.tokenID,
        filterData,
      )
      .subscribe(
        (res) => {
          console.log(res);
          if (res && res.data.transactions.length > 0) {
            res.data.transactions.forEach((trans) => {
              trans = parseDataTransaction(trans, this.coinMinimalDenom, this.tokenID);

              this.dataSource.data = res.data.transactions;
              this.pageData.length = res.data.transactions.length;
            });
            console.log(this.tokenDataList);
          }
          this.loading = false;
          this.dataSearch = res;
        },
        // () => {
        //   this.loading = false;
        // },
      );
  }

  getTemplate(): Array<TableTemplate> {
    return this.isNFTContract ? this.NFTTemplates : this.noneNFTTemplates;
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
        isNFTContract: this.isNFTContract,
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
    console.log(data);
    this.tokenDetail = data;
  }
}
