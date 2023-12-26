import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';
import {
  LENGTH_CHARACTER,
  NULL_ADDRESS,
  PAGE_EVENT,
  TIMEOUT_ERROR,
} from '../../../../../../core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../../../../core/constants/transaction.constant';
import {
  CodeTransaction,
  ModeExecuteTransaction,
  StatusTransaction,
} from '../../../../../../core/constants/transaction.enum';
import { TableTemplate } from '../../../../../../core/models/common.model';
import { CommonService } from '../../../../../../core/services/common.service';
import { shortenAddress } from '../../../../../../core/utils/common/shorten';
import { getTypeTx } from '../../../../../../global/global';
import * as _ from 'lodash';

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
    { matColumnDef: 'tx_hash', headerCellDef: 'Txn Hash', isShort: true },
    { matColumnDef: 'type', headerCellDef: 'Method', isShort: true },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'from_address', headerCellDef: 'From' },
    { matColumnDef: 'to_address', headerCellDef: 'To' },
    { matColumnDef: 'amountToken', headerCellDef: 'Amount', isShort: true },
  ];

  NFTTemplates: Array<TableTemplate> = [
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
  errTxt: string;

  coinMinimalDenom = this.environmentService.chainInfo.currencies[0].coinMinimalDenom;
  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  prefixAdd = this.environmentService.chainInfo.bech32Config.bech32PrefixAccAddr;
  coinInfo = this.environmentService.chainInfo.currencies[0];

  constructor(
    private environmentService: EnvironmentService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
    private router: Router,
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
    }, 30000);
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
      address: this.keyWord,
      contractAddr: this.contractAddress,
      idLte: nextKey,
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

    this.tokenService.getCW721Transfer(payload).subscribe({
      next: (res) => {
        if (res) {
          this.nextKey = null;
          if (res.cw721_activity?.length >= 100) {
            this.nextKey = res?.cw721_activity[res.cw721_activity?.length - 1]?.id;
            this.hasMore.emit(true);
          } else {
            this.hasMore.emit(false);
          }

          let txs = res.cw721_activity;
          txs.forEach((element) => {
            element['tx_hash'] = element.tx.hash;
            element['from_address'] = element.from || NULL_ADDRESS;
            element['to_address'] = element.to || NULL_ADDRESS;
            element['token_id'] = element.cw721_token.token_id;
            element['timestamp'] = element.tx.timestamp;
            element['status'] =
              element.tx.code == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;
            element['type'] = getTypeTx(element.tx)?.type;
            if (element['type'] === undefined) {
              const _type = element['tx'].transaction_messages[0]?.content['@type'];
              element['type'] = _.find(TYPE_TRANSACTION, { label: _type })?.value || _type.split('.').pop();
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
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
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

    this.tokenService.getCW20Transfer(payload).subscribe({
      next: (res) => {
        if (res) {
          this.nextKey = null;
          if (res.cw20_activity.length >= 100) {
            this.nextKey = res?.cw20_activity[res.cw20_activity.length - 1].height;
            this.hasMore.emit(true);
          } else {
            this.hasMore.emit(false);
          }
          let txs = res.cw20_activity;
          txs.forEach((element) => {
            element['tx_hash'] = element.tx.hash;
            element['from_address'] = element.from || NULL_ADDRESS;
            element['to_address'] = element.to || NULL_ADDRESS;
            element['timestamp'] = element.tx.timestamp;
            element['status'] =
              element.tx.code == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;
            element['type'] = getTypeTx(element.tx)?.type;
            element['decimal'] = element.cw20_contract.decimal;
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
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
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

  encodeData(data) {
    return encodeURIComponent(data);
  }

  ngAfterViewInit(): void {
    this.cdr.markForCheck();
  }

  goTo(data) {
    let url = '/tokens/' + this.linkToken + '/' + this.contractAddress + '/' + this.encodeData(data);
    this.router.navigateByUrl(url);
  }
}
