import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute } from '@angular/router';
import { TabsAccountLink } from 'src/app/core/constants/account.enum';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { IContractPopoverData } from 'src/app/core/models/contract.model';
import { UserService } from 'src/app/core/services/user.service';
import { LENGTH_CHARACTER, PAGE_EVENT } from '../../../../../../core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../../../../core/constants/transaction.constant';
import { CodeTransaction, ModeExecuteTransaction } from '../../../../../../core/constants/transaction.enum';
import { TableTemplate } from '../../../../../../core/models/common.model';
import { CommonService } from '../../../../../../core/services/common.service';
import { shortenAddress } from '../../../../../../core/utils/common/shorten';
import { Globals, convertDataAccountTransaction } from '../../../../../../global/global';

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
  timerGetUpTime: any;

  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  prefixAdd = this.environmentService.configValue.chain_info.bech32Config.bech32PrefixAccAddr;
  coinInfo = this.environmentService.configValue.chain_info.currencies[0];

  constructor(
    public global: Globals,
    public commonService: CommonService,
    private environmentService: EnvironmentService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.keyWord = params?.a || '';
    });

    this.template = this.getTemplate();
    this.displayedColumns = this.getTemplate().map((template) => template.matColumnDef);

    if (this.typeContract !== this.contractType.CW20) {
      this.linkToken = this.typeContract === this.contractType.CW721 ? 'token-nft' : 'token-abt';
    }
    this.getListData();
    this.timerGetUpTime = setInterval(() => {
      if (this.pageData.pageIndex === 0) {
        this.currentKey = null;
        this.getListData(null, true);
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.timerGetUpTime) {
      clearInterval(this.timerGetUpTime);
    }
  }

  getListData(nextKey = null, isReload = false) {
    if (this.typeContract !== this.contractType.CW20) {
      this.getListTransactionTokenCW721(nextKey, isReload);
    } else {
      this.getListTransactionTokenCW20(nextKey, isReload);
    }
  }

  async getListTransactionTokenCW721(nextKey = null, isReload = false) {
    let payload = {
      limit: 100,
      address: this.keyWord,
      heightLT: nextKey,
      contractAddr: this.contractAddress,
      isTransferTab: true,
    };

    if (this.typeContract === this.contractType.CW4973) {
      payload['isCW4973'] = true;
    }

    if (this.keyWord) {
      if (this.keyWord?.length === LENGTH_CHARACTER.TRANSACTION && this.keyWord == this?.keyWord.toUpperCase()) {
        payload['txHash'] = this.keyWord;
      } else {
        if (this.keyWord?.length >= LENGTH_CHARACTER.ADDRESS && this.keyWord?.startsWith(this.prefixAdd)) {
          payload['sender'] = this.keyWord;
          payload['receiver'] = this.keyWord;
        } else {
          payload['tokenId'] = this.keyWord;
        }
      }
    }

    this.userService.getListNFTByAddress(payload).subscribe(
      (res) => {
        if (res) {
          this.nextKey = null;
          if (res.transaction.length >= 100) {
            this.nextKey = res?.transaction[res.transaction.length - 1]?.height;
            this.hasMore.emit(true);
          } else {
            this.hasMore.emit(false);
          }

          let txs = convertDataAccountTransaction(res, this.coinInfo, TabsAccountLink.NftTxs, false, null);

          txs.forEach((element, index) => {
            element['from_address'] = element.fromAddress;
            element['to_address'] = element.toAddress;
            element['token_id'] = element.arrEvent?.length > 1 ? 'More' : element.tokenId;
            element['type'] = element.arrEvent[0]?.type?.replace('Contract: ', '');
            if (this.typeContract === this.contractType.CW4973) {
              if (element['type'] === 'mint') {
                element['type'] = 'take';
              } else if (element['type'] === 'burn') {
                element['type'] = 'unequip';
              }
            }
          });
          if (this.dataSource.data.length > 0 && !isReload) {
            this.dataSource.data = [...this.dataSource.data, ...txs];
          } else {
            this.dataSource.data = [...txs];
          }

          this.pageData.length = this.dataSource.data.length;
          this.resultLength.emit(this.pageData.length);
        }
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
  }

  async getListTransactionTokenCW20(nextKey = null, isReload = false) {
    let payload = {
      limit: 100,
      address: this.keyWord,
      heightLT: nextKey,
      contractAddr: this.contractAddress,
    };

    if (this.keyWord) {
      if (this.keyWord?.length === LENGTH_CHARACTER.TRANSACTION && this.keyWord == this?.keyWord.toUpperCase()) {
        payload['txHash'] = this.keyWord;
      } else {
        payload['sender'] = this.keyWord;
        payload['receiver'] = this.keyWord;
      }
    }

    this.userService.getListFTByAddress(payload).subscribe(
      (res) => {
        if (res) {
          this.nextKey = null;
          if (res.transaction.length >= 100) {
            this.nextKey = res?.transaction[res.transaction.length - 1].height;
            this.hasMore.emit(true);
          } else {
            this.hasMore.emit(false);
          }

          let txs = convertDataAccountTransaction(res, this.coinInfo, TabsAccountLink.FtsTxs, false, null);
          txs.forEach((element, index) => {
            element['arrEvent'] = element.arrEvent?.filter((k) => k.contractAddress === this.contractAddress);
            element['from_address'] = element.arrEvent[0]?.fromAddress;
            element['to_address'] = element.arrEvent[0]?.toAddress;
            element['type'] = element?.action;
          });
          if (this.dataSource.data.length > 0 && !isReload) {
            this.dataSource.data = [...this.dataSource.data, ...txs];
          } else {
            this.dataSource.data = [...txs];
          }

          this.pageData.length = this.dataSource.data.length;
          this.resultLength.emit(this.pageData.length);
        }
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
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
      this.getListData(this.nextKey);
      this.currentKey = this.nextKey;
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
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
}
