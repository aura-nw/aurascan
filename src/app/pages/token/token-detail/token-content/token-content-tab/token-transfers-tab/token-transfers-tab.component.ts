import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { IContractPopoverData } from 'src/app/core/models/contract.model';
import { parseDataTransaction } from 'src/app/core/utils/common/info-common';
import { LENGTH_CHARACTER, PAGE_EVENT } from '../../../../../../core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../../../../core/constants/transaction.constant';
import { CodeTransaction, ModeExecuteTransaction } from '../../../../../../core/constants/transaction.enum';
import { TableTemplate } from '../../../../../../core/models/common.model';
import { CommonService } from '../../../../../../core/services/common.service';
import { TokenService } from '../../../../../../core/services/token.service';
import { shortenAddress } from '../../../../../../core/utils/common/shorten';
import { Globals } from '../../../../../../global/global';

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
  @Input() contractAddress: string;
  @Input() keyWord = '';
  @Input() isSearchAddress: boolean;
  @Output() resultLength = new EventEmitter<any>();

  noneNFTTemplates: Array<TableTemplate> = [
    // { matColumnDef: 'action', headerCellDef: '' },
    { matColumnDef: 'tx_hash', headerCellDef: 'Txn Hash', isShort: true },
    { matColumnDef: 'type', headerCellDef: 'Method', isShort: true },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'from_address', headerCellDef: 'From' },
    { matColumnDef: 'to_address', headerCellDef: 'To' },
    { matColumnDef: 'amountToken', headerCellDef: 'Amount', isShort: true },
  ];

  NFTTemplates: Array<TableTemplate> = [
    // { matColumnDef: 'action', headerCellDef: '' },
    { matColumnDef: 'tx_hash', headerCellDef: 'Txn Hash', isShort: true },
    { matColumnDef: 'type', headerCellDef: 'Method', isShort: true },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'from_address', headerCellDef: 'From' },
    { matColumnDef: 'to_address', headerCellDef: 'To' },
    { matColumnDef: 'token_id', headerCellDef: 'Token ID' },
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
  modeExecuteTransaction = ModeExecuteTransaction;
  nftDetail: any;

  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  prefixAdd = this.environmentService.configValue.chain_info.bech32Config.bech32PrefixAccAddr;

  constructor(
    public global: Globals,
    public commonService: CommonService,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.keyWord = params?.a || '';
    });

    this.getDataTable();
    this.template = this.getTemplate();
    this.displayedColumns = this.getTemplate().map((template) => template.matColumnDef);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.keyWord.length > 0) {
      this.getListTransactionToken(this.keyWord);
    }
  }

  getDataTable(): void {
    this.loading = true;
    this.getListTransactionToken();
  }

  getListTransactionToken(dataSearch = '') {
    let filterData = {};
    filterData['keyWord'] = this.keyWord || dataSearch;
    if (
      filterData['keyWord']?.length >= LENGTH_CHARACTER.ADDRESS &&
      filterData['keyWord']?.startsWith(this.prefixAdd)
    ) {
      filterData['isSearchWallet'] = true;
    }

    this.tokenService
      .getListTokenTransfer(
        this.pageData.pageSize,
        this.pageData.pageIndex * this.pageData.pageSize,
        this.contractAddress,
        filterData,
      )
      .subscribe((res) => {
        if (res && res.data?.length > 0) {
          this.dataSource.data = res.data;
          res.data.forEach((trans) => {
            trans['tx_response'] = JSON.parse(trans.tx);
            trans = parseDataTransaction(trans, this.coinMinimalDenom, this.contractAddress);
            this.dataSource.data = res.data;
          });
          this.pageData.length = res.meta?.count;
        }
        this.loading = false;
      });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
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
    this.pageData.pageIndex = e.pageIndex;
    this.getListTransactionToken();
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  getNFTDetail(data) {
    if (this.isNFTContract) {
      this.tokenService.getNFTDetail(this.contractAddress, data.token_id).subscribe((res) => {
        this.nftDetail = res.data;
      });
    }
  }

  getPopoverData(data): IContractPopoverData {
    return {
      amount: data?.amountToken || 0,
      code: Number(data?.tx_response?.code),
      fee: data?.fee || 0,
      from_address: data?.from_address || '',
      to_address: data?.to_address || '',
      price: 0,
      status: data?.status,
      symbol: this.denom,
      tokenAddress: data?.contract_address,
      tx_hash: data?.tx_hash || '',
      gas_used: data?.tx_response?.gas_used,
      gas_wanted: data?.tx_response?.gas_wanted,
      nftDetail: this.nftDetail,
      modeExecute: data?.modeExecute,
    };
  }
}
