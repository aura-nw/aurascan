import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { Subject, takeUntil } from 'rxjs';
import { LENGTH_CHARACTER, NULL_ADDRESS, PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EModeToken } from 'src/app/core/constants/token.enum';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';
import { CodeTransaction, ModeExecuteTransaction, StatusTransaction } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { TokenService } from 'src/app/core/services/token.service';
import { transferAddress } from 'src/app/core/utils/common/address-converter';
import { getTypeTx } from 'src/app/core/utils/common/info-common';
import { shortenAddress } from 'src/app/core/utils/common/shorten';
import { convertTxIBC } from 'src/app/global/global';

@Component({
  selector: 'app-token-transfers-tab',
  templateUrl: './token-transfers-tab.component.html',
  styleUrls: ['./token-transfers-tab.component.scss'],
})
export class TokenTransfersTabComponent implements OnInit, AfterViewInit {
  @Input() tokenDetail: any;
  @Input() keyWord = '';
  @Input() isSearchAddress: boolean;
  @Input() decimalValue: number;
  @Input() channelPath: any;
  @Output() hasMore = new EventEmitter<any>();

  noneNFTTemplates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Txn Hash', isShort: true, headerWidth: 230 },
    { matColumnDef: 'type', headerCellDef: 'Method', isShort: true, headerWidth: 170 },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time', headerWidth: 150 },
    { matColumnDef: 'from_address', headerCellDef: 'From', headerWidth: 250 },
    { matColumnDef: 'to_address', headerCellDef: 'To', headerWidth: 180 },
    { matColumnDef: 'amountToken', headerCellDef: 'Amount', isShort: true, headerWidth: 100 },
  ];

  NFTTemplates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Txn Hash', isShort: true, headerWidth: 230 },
    { matColumnDef: 'type', headerCellDef: 'Method', isShort: true, headerWidth: 170 },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time', headerWidth: 150 },
    { matColumnDef: 'from_address', headerCellDef: 'From', headerWidth: 250 },
    { matColumnDef: 'to_address', headerCellDef: 'To', headerWidth: 180 },
    { matColumnDef: 'token_id', headerCellDef: 'Token ID' },
    { matColumnDef: 'details', headerCellDef: 'Details', headerWidth: 120 },
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
  nextKey = null;
  currentKey = null;
  contractType = ContractRegisterType;
  timerGetUpTime: any;
  errTxt: string;
  typeContract: string;
  contractAddress: string;
  EModeToken = EModeToken;
  destroyed$ = new Subject<void>();
  linkAddress: string;
  isExistDenom = false;
  denomFilter = '';
  addressNameTag = '';

  coinMinimalDenom = this.environmentService.chainInfo.currencies[0].coinMinimalDenom;
  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  prefixAdd = this.environmentService.chainInfo.bech32Config.bech32PrefixAccAddr;
  coinInfo = this.environmentService.chainInfo.currencies[0];
  chainInfo = this.environmentService.chainInfo;

  constructor(
    private environmentService: EnvironmentService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
    private router: Router,
    private nameTagService: NameTagService,
  ) {}

  ngOnInit(): void {
    this.linkAddress = this.contractAddress = this.route.snapshot.paramMap.get('contractAddress');
    this.typeContract = this.tokenDetail?.type;
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      this.keyWord = params?.a || '';
    });

    this.template = this.getTemplate();
    this.displayedColumns = this.getTemplate().map((template) => template.matColumnDef);

    this.getListData();
    this.timerGetUpTime = setInterval(() => {
      if (this.pageData.pageIndex === 0) {
        this.currentKey = null;
        this.getListData(null, true);
      }
    }, 30000);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    clearInterval(this.timerGetUpTime);
  }

  getListData(nextKey = null, isReload = false) {
    const nameTagTemp = this.nameTagService.findAddressByNameTag(this.keyWord) || this.keyWord;
    const { accountAddress } = transferAddress(this.chainInfo.bech32Config.bech32PrefixAccAddr, nameTagTemp);
    // get address cosmos name tag
    this.addressNameTag = accountAddress;

    if (this.tokenDetail.modeToken === EModeToken.CWToken) {
      if (this.typeContract !== this.contractType.CW20) {
        this.getListTransactionTokenCW721(nextKey, isReload);
      } else {
        this.getListTransactionTokenCW20(nextKey, isReload);
      }
    } else {
      if (this.isExistDenom || this.channelPath?.path) {
        this.getListTransactionTokenIBC(nextKey);
      } else {
        this.tokenService.pathDenom$.pipe(takeUntil(this.destroyed$)).subscribe((res) => {
          this.channelPath = res;
          this.denomFilter = this.channelPath?.path + '/' + this.channelPath?.base_denom;
          if (this.isExistDenom) {
            this.getListTransactionTokenIBC();
          }
        });
        this.isExistDenom = true;
      }
    }
  }

  async getListTransactionTokenCW721(nextKey = null, isReload = false) {
    let payload = {
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
          payload['sender'] = this.addressNameTag || this.keyWord;
          payload['receiver'] = this.addressNameTag || this.keyWord;
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
            element['lstTypeTemp'] = _.get(element, 'tx.transaction_messages');
          });

          if (this.dataSource.data.length > 0 && !isReload) {
            this.dataSource.data = [...this.dataSource.data, ...txs];
          } else {
            this.dataSource.data = [...txs];
          }

          this.pageData.length = this.dataSource.data.length;
          this.tokenService.setTotalTransfer(this.pageData.length);
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
      heightLT: nextKey,
      contractAddr: this.contractAddress,
    };

    if (this.keyWord) {
      if (this.keyWord?.length === LENGTH_CHARACTER.TRANSACTION && this.keyWord == this?.keyWord.toUpperCase()) {
        payload['txHash'] = this.keyWord;
      } else {
        payload['sender'] = this.addressNameTag || this.keyWord;
        payload['receiver'] = this.addressNameTag || this.keyWord;
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
            element['lstTypeTemp'] = _.get(element, 'tx.transaction_messages');
          });
          if (this.dataSource.data.length > 0 && !isReload) {
            this.dataSource.data = [...this.dataSource.data, ...txs];
          } else {
            this.dataSource.data = [...txs];
          }

          this.pageData.length = this.dataSource.data.length;
          this.tokenService.totalTransfer$.next(this.pageData.length);
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

  getListTransactionTokenIBC(nextKey = null) {
    this.denomFilter = this.channelPath?.path + '/' + this.channelPath?.base_denom;
    let payload = {
      limit: this.pageData.pageSize,
      heightLT: nextKey,
      denom: this.denomFilter,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      address: null,
    };

    if (this.keyWord) {
      if (this.keyWord?.length === LENGTH_CHARACTER.TRANSACTION && this.keyWord == this?.keyWord.toUpperCase()) {
        payload['txHash'] = this.keyWord;
      } else {
        payload['address'] = this.addressNameTag || this.keyWord;
      }
    }

    this.tokenService.getListTransactionTokenIBC(payload).subscribe({
      next: (res) => {
        if (res) {
          this.nextKey = null;
          if (res.ibc_ics20?.length >= this.pageData.pageSize) {
            this.nextKey = res?.ibc_ics20[res.ibc_ics20.length - 1]?.height;
          }

          const txs = convertTxIBC(res, this.coinInfo);
          txs.forEach((element) => {
            element['amount'] = element.amountTemp || 0;
            element['decimal'] = this.tokenDetail?.decimals || this.tokenDetail?.decimal;
          });

          this.dataSource = new MatTableDataSource(txs);
          this.pageData.length = res.ibc_ics20_aggregate?.aggregate?.count;
          this.tokenService.totalTransfer$.next(this.pageData.length);
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
    let result = this.noneNFTTemplates;
    if (this.typeContract && this.typeContract !== this.contractType.CW20) {
      result = this.NFTTemplates;
    }
    return result;
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }

  pageEvent(e: PageEvent): void {
    if (this.tokenDetail.modeToken === EModeToken.CWToken) {
      const { length, pageIndex, pageSize } = e;
      const next = length <= (pageIndex + 2) * pageSize;
      this.pageData = e;
      if (next && this.nextKey && this.currentKey !== this.nextKey) {
        this.getListData(this.nextKey);
        this.currentKey = this.nextKey;
      }
    } else {
      this.pageData.pageIndex = e.pageIndex;
      this.getListData();
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
    const type = this.typeContract === this.contractType.CW721 ? 'cw721' : 'cw4973';
    this.router.navigate(['/token', type, this.contractAddress, this.encodeData(data)]);
  }
}
