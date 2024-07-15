import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { catchError, map, merge, of, switchMap } from 'rxjs';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { PAGE_EVENT, TIMEOUT_ERROR } from '../../../../app/core/constants/common.constant';
import { TableTemplate } from '../../../../app/core/models/common.model';
import { BlockService } from '../../../../app/core/services/block.service';
import { CommonService } from '../../../../app/core/services/common.service';
import { convertDataBlock, convertDataTransactionSimple, mappingMethodName } from '../../../../app/global/global';

@Component({
  selector: 'app-block-detail',
  templateUrl: './block-detail.component.html',
  styleUrls: ['./block-detail.component.scss'],
})
export class BlockDetailComponent implements OnInit {
  blockHeight: string | number;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  NOT_FOUND = 'NOT_FOUND';

  blockDetail = undefined;
  TAB = [
    {
      id: 0,
      value: 'Summary',
    },
    {
      id: 1,
      value: 'JSON',
    },
  ];

  cosmosTemplates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Message' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'fee', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'hash', headerCellDef: 'EVM Transaction' },
  ];

  evmTemplates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'EVM Txn Hash' },
    { matColumnDef: 'method', headerCellDef: 'Method' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'from', headerCellDef: 'From' },
    { matColumnDef: 'to', headerCellDef: 'To' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'hash', headerCellDef: 'Cosmos Txn' },
  ];
  displayedCosmosCol: string[] = this.cosmosTemplates.map((dta) => dta.matColumnDef);
  displayedEvmCol: string[] = this.evmTemplates.map((dta) => dta.matColumnDef);
  dataSourceCosmos: MatTableDataSource<any> = new MatTableDataSource();
  dataSourceEvm: MatTableDataSource<any> = new MatTableDataSource();
  dataTxs: any[];
  loading = true;
  loadingCosmosTxs = true;
  loadingEVMTxs = true;
  isRawData = false;
  errTxt = null;
  errTxtCosmosTxs = null;
  errTxtEvmTxs = null;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe();

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  coinInfo = this.environmentService.chainInfo.currencies[0];
  decimal = this.environmentService.chainInfo.currencies[0].coinDecimals;
  evmDecimal = this.environmentService.evmDecimal;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blockService: BlockService,
    public commonService: CommonService,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
    private transactionService: TransactionService,
  ) {}

  ngOnInit(): void {
    this.blockHeight = this.route.snapshot.paramMap.get('height');
    if (this.blockHeight === 'null') {
      this.router.navigate(['/']);
    }
    this.getDetail();
  }

  getDetail(): void {
    if (this.blockHeight) {
      this.getDetailByHeight();
    }
  }

  getDetailByHeight() {
    let payload = {
      limit: 1,
      height: this.blockHeight,
    };

    this.blockService
      .getDataBlockDetail(payload)
      .pipe(
        switchMap((res) => {
          if (res?.block?.length > 0) {
            const linkS3 = _.get(res, 'block[0].data.linkS3');

            if (linkS3?.length > 0) {
              return this.commonService.getRawData(linkS3).pipe(
                map((data) => {
                  res.block[0].data = data;

                  return this.mappingBlockData(res);
                }),
              );
            } else {
              return of(this.mappingBlockData(res));
            }
          }

          throw new Error(this.NOT_FOUND);
        }),
        switchMap(() => {
          this.loading = false;
          let result = merge(this.getListCosmosTxn(), this.getListEVMTxn());
          return result;
        }),
      )
      .subscribe({
        next: () => {},
        error: (e) => {
          if (e.message === this.NOT_FOUND) {
            setTimeout(() => {
              this.getDetailByHeight();
            }, 10000);
            this.errTxt = null;
            this.loading = false;
          } else {
            if (e.name === TIMEOUT_ERROR) {
              this.errTxt = e.message;
            } else {
              this.errTxt = e.status + ' ' + e.statusText;
            }
            this.loading = false;
          }
        },
        complete: () => {},
      });
  }

  getListCosmosTxn() {
    const payload = {
      limit: 100,
      height: this.blockHeight,
    };
    return this.transactionService.getListTx(payload).pipe(
      map((res) => {
        if (res?.transaction?.length > 0) {
          this.parseDataListCosmosTxn(res?.transaction);
        }
        this.loadingCosmosTxs = false;
        return true;
      }),
      catchError((e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxtCosmosTxs = e.message;
        } else {
          this.errTxtCosmosTxs = e.status + ' ' + e.statusText;
        }
        this.loadingCosmosTxs = false;
        return of(null);
      }),
    );
  }

  getListEVMTxn() {
    const payload = {
      limit: 100,
      height: this.blockHeight,
    };
    return this.transactionService.queryTransactionByEvmHash(payload).pipe(
      switchMap((res) => {
        const listTemp = res?.transaction
          ?.filter((j) => j.evm_transaction.data?.length > 0)
          ?.map((k) => k.evm_transaction.data?.substring(0, 8));
        const listMethodId = _.uniq(listTemp);
        return this.transactionService.getListMappingName(listMethodId).pipe(
          map((element) => {
            if (res?.transaction?.length > 0) {
              return res.transaction.map((tx) => {
                const methodId = _.get(tx, 'evm_transaction.data')?.substring(0, 8);
                return {
                  ...tx,
                  method: mappingMethodName(element, methodId),
                };
              });
            }
            return [];
          }),
        );
      }),
      map((res) => {
        if (res?.length > 0) {
          this.parseDataListEvmTxn(res);
        }
        this.loadingEVMTxs = false;

        return true;
      }),
      catchError((e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxtEvmTxs = e.message;
        } else {
          this.errTxtEvmTxs = e.status + ' ' + e.statusText;
        }
        this.loadingEVMTxs = false;
        return of(null);
      }),
    );
  }

  mappingBlockData(res) {
    const blockArr = convertDataBlock(res);
    if (blockArr?.length > 0) {
      const block = blockArr[0];
      block['round'] = _.get(res.block[0], 'data.block.last_commit.round');
      block['chainid'] = _.get(res.block[0], 'data.block.header.chain_id');
      block['json_data'] = _.get(res.block[0], 'data.block');
      block['gas_used'] = block['gas_wanted'] = 0;
      block['events'] = _.get(res.block[0], 'data.block_result.begin_block_events');
      const blockEnd = _.get(res.block[0], 'data.block_result.end_block_events');
      if (blockEnd) {
        block['events'] = block['events'].concat(blockEnd);
      }
      this.blockDetail = block;
    }
  }

  changeType(type: boolean) {
    this.isRawData = type;
  }

  parseDataListCosmosTxn(txs) {
    let dataTempTx = {};
    dataTempTx['transaction'] = txs;
    if (txs.length > 0) {
      txs = convertDataTransactionSimple(dataTempTx, this.environmentService.getDecimals());
      dataTempTx['transaction'].forEach((k) => {
        this.blockDetail['gas_used'] += +k?.gas_used;
        this.blockDetail['gas_wanted'] += +k?.gas_wanted;
      });
      this.dataSourceCosmos.data = txs;
    }
  }

  parseDataListEvmTxn(txs) {
    if (txs.length > 0) {
      this.dataSourceEvm.data = txs.map((tx) => {
        return {
          ...tx,
          tx_hash: _.get(tx, 'evm_transaction.hash'),
          from: _.get(tx, 'evm_transaction.from'),
          to: _.get(tx, 'evm_transaction.to'),
          amount: _.get(tx, 'transaction_messages[0].content.data.value') || 0,
        };
      });
    }
  }

  isSameHeight(value: string, blockHeight: string | number, blockDetailHeight: string | number): boolean {
    return value?.toString() === (blockHeight || blockDetailHeight)?.toString();
  }
}
