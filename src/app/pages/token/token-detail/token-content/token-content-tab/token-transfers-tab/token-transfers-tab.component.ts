import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { IContractPopoverData } from 'src/app/core/models/contract.model';
import { parseDataTransaction } from 'src/app/core/utils/common/info-common';
import {
  LENGTH_CHARACTER,
  LIST_TYPE_CONTRACT_ADDRESS,
  PAGE_EVENT,
} from '../../../../../../core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../../../../core/constants/transaction.constant';
import { CodeTransaction, ModeExecuteTransaction } from '../../../../../../core/constants/transaction.enum';
import { TableTemplate } from '../../../../../../core/models/common.model';
import { CommonService } from '../../../../../../core/services/common.service';
import { TokenService } from '../../../../../../core/services/token.service';
import { shortenAddress } from '../../../../../../core/utils/common/shorten';
import { Globals } from '../../../../../../global/global';

@Component({
  selector: 'app-token-transfers-tab',
  templateUrl: './token-transfers-tab.component.html',
  styleUrls: ['./token-transfers-tab.component.scss'],
})
export class TokenTransfersTabComponent implements OnInit, AfterViewInit {
  @Input() typeContract: string;
  @Input() contractAddress: string;
  @Input() keyWord = '';
  @Input() isSearchAddress: boolean;
  @Input() decimalValue: number;
  @Output() resultLength = new EventEmitter<any>();
  @Output() hasMore = new EventEmitter<any>();

  noneNFTTemplates: Array<TableTemplate> = [
    // { matColumnDef: 'action', headerCellDef: '' },
    { matColumnDef: 'tx_hash', headerCellDef: 'Txn Hash', isShort: true },
    { matColumnDef: 'type', headerCellDef: 'Method', isShort: true },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'from_address', headerCellDef: 'From' },
    { matColumnDef: 'to_address', headerCellDef: 'To' },
    { matColumnDef: 'amountToken', headerCellDef: 'Amount', isShort: true },
  ];

  NFTTemplates: Array<TableTemplate> = [
    // { matColumnDef: 'action', headerCellDef: '' },
    { matColumnDef: 'tx_hash', headerCellDef: 'Txn Hash', isShort: true },
    { matColumnDef: 'type', headerCellDef: 'Method', isShort: true },
    { matColumnDef: 'status', headerCellDef: 'Result' },
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
  linkToken = 'token';
  nextKey = null;
  currentKey = null;
  contractType = ContractRegisterType;

  coinDecimals = this.environmentService.configValue.chain_info.currencies[0].coinDecimals;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  prefixAdd = this.environmentService.configValue.chain_info.bech32Config.bech32PrefixAccAddr;

  constructor(
    public global: Globals,
    public commonService: CommonService,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.keyWord = params?.a || '';
    });

    this.getListTransactionToken(this.keyWord);
    this.template = this.getTemplate();
    this.displayedColumns = this.getTemplate().map((template) => template.matColumnDef);

    if (this.typeContract !== this.contractType.CW20) {
      this.linkToken = this.typeContract === this.contractType.CW721 ? 'token-nft' : 'token-abt';
    }
  }

  async getListTransactionToken(dataSearch = '', nextKey = null) {
    if (!this.dataSource.data) {
      this.loading = true;
    }
    let filterData = {};
    filterData['keyWord'] = this.keyWord || dataSearch;
    if (
      filterData['keyWord']?.length >= LENGTH_CHARACTER.ADDRESS &&
      filterData['keyWord']?.startsWith(this.prefixAdd)
    ) {
      filterData['isSearchWallet'] = true;
    }

    const res = await this.tokenService.getListTokenTransferIndexer(100, this.contractAddress, filterData, nextKey);
    if (res?.data?.code === 200) {
      this.nextKey = res.data.data.nextKey || null;
      res?.data?.data?.transactions.forEach((trans) => {
        trans = parseDataTransaction(trans, this.coinMinimalDenom, this.contractAddress);
        const tempConvert = trans.amountToken / this.decimalValue;
        trans.amountToken = tempConvert < 0.000001 ? 0 : tempConvert;
      });

      if (this.dataSource.data.length > 0) {
        this.dataSource.data = [...this.dataSource.data, ...res.data.data.transactions];
      } else {
        this.dataSource.data = [...res.data.data.transactions];
      }
      this.pageData.length = this.dataSource.data.length;
      this.resultLength.emit(this.pageData.length);
      if (this.nextKey) {
        this.hasMore.emit(true);
      } else {
        this.hasMore.emit(false);
      }
    }
    this.loading = false;
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getTemplate(): Array<TableTemplate> {
    return this.typeContract !== this.contractType.CW20 ? this.NFTTemplates : this.noneNFTTemplates;
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }

  pageEvent(e: PageEvent): void {
    const { length, pageIndex, pageSize } = e;
    const next = length <= (pageIndex + 2) * pageSize;
    this.pageData = e;
    if (next && this.nextKey && this.currentKey !== this.nextKey) {
      this.getListTransactionToken(null, this.nextKey);
      this.currentKey = this.nextKey;
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  getNFTDetail(data) {
    if (this.typeContract !== this.contractType.CW20) {
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

  encodeData(data) {
    return encodeURIComponent(data);
  }

  ngAfterViewInit(): void {
    this.cdr.markForCheck();
  }

  isContractAddress(type, address) {
    if (LIST_TYPE_CONTRACT_ADDRESS.includes(type) && address?.length > LENGTH_CHARACTER.ADDRESS) {
      return true;
    }
    return false;
  }
}
