import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { Subject, map, switchMap, takeUntil } from 'rxjs';
import { LENGTH_CHARACTER, NULL_ADDRESS, PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { EvmContractRegisterType } from 'src/app/core/constants/contract.enum';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';
import { CodeTransaction, ModeExecuteTransaction, StatusTransaction } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { transferAddress } from 'src/app/core/utils/common/address-converter';
import { getTypeTx } from 'src/app/core/utils/common/info-common';
import { shortenAddress } from 'src/app/core/utils/common/shorten';
import { mappingMethodName } from 'src/app/global/global';
import { EWalletType } from '../../../../../core/constants/wallet.constant';
import { ContractService } from '../../../../../core/services/contract.service';

@Component({
  selector: 'app-evm-token-transfers-tab',
  templateUrl: './evm-token-transfers-tab.component.html',
  styleUrls: ['./evm-token-transfers-tab.component.scss'],
})
export class EvmTokenTransfersTabComponent implements OnInit, AfterViewInit {
  @Input() tokenDetail: any;
  @Input() keyWord = '';
  @Input() isSearchAddress: boolean;
  @Input() decimalValue: number;
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
  contractType = EvmContractRegisterType;
  timerGetUpTime: any;
  errTxt: string;
  typeContract: string;
  contractAddress: string;
  destroyed$ = new Subject<void>();
  linkAddress: string;
  addressNameTag = '';
  searchToken: string;
  smartContractList: string[] = [];

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
    private transactionService: TransactionService,
    private nameTagService: NameTagService,
    private contractService: ContractService,
  ) {}

  ngOnInit(): void {
    this.linkAddress = this.contractAddress = this.route.snapshot.paramMap.get('contractAddress');
    this.typeContract = this.tokenDetail?.type;
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      this.keyWord = params?.a || '';
      this.searchToken = params?.t;
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

    if (this.timerGetUpTime) {
      clearInterval(this.timerGetUpTime);
    }
  }

  getListData(nextKey = null, isReload = false) {
    const nameTagTemp = this.nameTagService.findAddressByNameTag(this.keyWord) || this.keyWord;
    const { accountAddress, accountEvmAddress } = transferAddress(
      this.chainInfo.bech32Config.bech32PrefixAccAddr,
      nameTagTemp,
    );
    // get address cosmos name tag
    this.addressNameTag = accountEvmAddress;

    if (this.typeContract === this.contractType.ERC20) {
      this.getListTransactionTokenERC20(nextKey, isReload);
    } else {
      this.getListTransactionTokenERC721(nextKey, isReload);
    }
  }

  async getListTransactionTokenERC721(nextKey = null, isReload = false) {
    let payload = {
      contractAddr: this.contractAddress,
      idLte: nextKey,
    };

    if (this.searchToken) {
      payload['tokenId'] = this.searchToken;
    } else if (this.keyWord) {
      if (this.keyWord?.length === LENGTH_CHARACTER.EVM_TRANSACTION) {
        payload['txHash'] = this.keyWord;
      } else {
        if (this.keyWord?.length >= LENGTH_CHARACTER.EVM_ADDRESS && this.keyWord?.startsWith(EWalletType.EVM)) {
          payload['sender'] = this.addressNameTag || this.keyWord;
          payload['receiver'] = this.addressNameTag || this.keyWord;
        } else {
          payload['tokenId'] = this.keyWord;
        }
      }
    }

    this.tokenService
      .getERC721Transfer(payload)
      .pipe(
        switchMap((res) => {
          const erc721Activities = res?.erc721_activity;
          const listTemp = erc721Activities
            ?.filter((j) => j.evm_transaction?.data?.length > 0)
            ?.map((k) => k.evm_transaction?.data?.substring(0, 8));
          const listMethodId = _.uniq(listTemp);
          return this.transactionService.getListMappingName(listMethodId).pipe(
            map((element) => {
              if (erc721Activities?.length > 0) {
                return erc721Activities.map((tx) => {
                  const methodId = _.get(tx, 'evm_transaction.data')?.substring(0, 8);
                  return {
                    ...tx,
                    type: mappingMethodName(element, methodId),
                  };
                });
              }
              return [];
            }),
          );
        }),
      )
      .pipe(
        switchMap((res) => {
          let listAddr = [];
          res.forEach((element) => {
            if (element.from) {
              listAddr.push(element.from);
            }
            if (element.to) {
              listAddr.push(element.to);
            }
          });
          const listAddrUnique = _.uniq(listAddr);
          return this.contractService.findEvmContractList(listAddrUnique).pipe(
            map((r) => {
              this.smartContractList = _.uniq((r?.evm_smart_contract || []).map((i) => i?.address));
              return { listTokens: res };
            }),
          );
        }),
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.nextKey = null;
            const listToken = res?.listTokens;
            if (listToken?.length >= 100) {
              this.nextKey = res[listToken.length - 1]['id'];
              this.hasMore.emit(true);
            } else {
              this.hasMore.emit(false);
            }

            listToken.forEach((element) => {
              element['tx_hash'] = element.evm_transaction.hash;
              element['from_address'] = element.from || NULL_ADDRESS;
              element['to_address'] = element.to || NULL_ADDRESS;
              element['token_id'] = element.erc721_token.token_id;
              element['timestamp'] = element.evm_transaction.transaction.timestamp;
              element['status'] =
                element.evm_transaction.transaction.code == CodeTransaction.Success
                  ? StatusTransaction.Success
                  : StatusTransaction.Fail;
              element['type'] = element?.type;
              element['lstTypeTemp'] = _.get(element, 'evm_transaction.transaction_message');
            });

            if (this.dataSource.data.length > 0 && !isReload) {
              this.dataSource.data = [...this.dataSource.data, ...listToken];
            } else {
              this.dataSource.data = [...listToken];
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

  async getListTransactionTokenERC20(nextKey = null, isReload = false) {
    let payload = {
      limit: 100,
      heightLT: nextKey,
      contractAddr: this.contractAddress,
    };

    if (this.keyWord) {
      if (
        this.keyWord?.length === LENGTH_CHARACTER.EVM_TRANSACTION &&
        this.keyWord?.toLowerCase() == this?.keyWord.toLowerCase()
      ) {
        payload['txHash'] = this.keyWord;
      } else {
        payload['sender'] = this.addressNameTag || this.keyWord;
        payload['receiver'] = this.addressNameTag || this.keyWord;
      }
    }

    this.tokenService
      .getERC20Transfer(payload)
      .pipe(
        switchMap((res) => {
          const listTemp = res?.erc20_activity
            ?.filter((j) => j.evm_transaction?.data?.length > 0)
            ?.map((k) => k.evm_transaction?.data?.substring(0, 8));
          const listMethodId = _.uniq(listTemp);
          return this.transactionService.getListMappingName(listMethodId).pipe(
            map((element) => {
              if (res?.erc20_activity?.length > 0) {
                return res.erc20_activity.map((tx) => {
                  const methodId = _.get(tx, 'evm_transaction.data')?.substring(0, 8);
                  return {
                    ...tx,
                    type: mappingMethodName(element, methodId),
                  };
                });
              }
              return [];
            }),
          );
        }),
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.nextKey = null;
            if (res.length >= 100) {
              this.nextKey = res[res.length - 1]['height'];
              this.hasMore.emit(true);
            } else {
              this.hasMore.emit(false);
            }

            res.forEach((element) => {
              element['tx_hash'] = element.tx_hash;
              element['from_address'] = element.from?.toLowerCase() || NULL_ADDRESS;
              element['to_address'] = element.to?.toLowerCase() || NULL_ADDRESS;
              element['timestamp'] = _.get(element, 'evm_transaction.transaction.timestamp');
              element['status'] =
                _.get(element, 'evm_transaction.transaction.code') == CodeTransaction.Success
                  ? StatusTransaction.Success
                  : StatusTransaction.Fail;
              element['decimal'] = _.get(element, 'erc20_contract.decimal');
              element['lstTypeTemp'] = _.get(element, 'evm_transaction.transaction_message');
            });
            if (this.dataSource.data.length > 0 && !isReload) {
              this.dataSource.data = [...this.dataSource.data, ...res];
            } else {
              this.dataSource.data = [...res];
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

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getTemplate(): Array<TableTemplate> {
    let result = this.noneNFTTemplates;
    if (this.typeContract && this.typeContract !== this.contractType.ERC20) {
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
    this.router.navigate(['/token/evm/erc721', this.contractAddress, this.encodeData(data)]);
  }

  isEvmSmartContract(addr) {
    return this.smartContractList.filter((i) => i === addr).length > 0;
  }
}

