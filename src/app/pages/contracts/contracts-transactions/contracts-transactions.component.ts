import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Subject, map } from 'rxjs';
import { TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { CONTRACT_TABLE_TEMPLATES, EVM_CONTRACT_TABLE_TEMPLATES } from 'src/app/core/constants/contract.constant';
import { EWalletType } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { getFunctionNameByMethodId } from 'src/app/core/helpers/chain';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ITableContract } from 'src/app/core/models/contract.model';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { convertDataTransaction } from 'src/app/global/global';

@Component({
  selector: 'app-contracts-transactions',
  templateUrl: './contracts-transactions.component.html',
  styleUrls: ['./contracts-transactions.component.scss'],
})
export class ContractsTransactionsComponent implements OnInit {
  templates: Array<TableTemplate> = CONTRACT_TABLE_TEMPLATES;
  contractInfo: ITableContract = {
    contractsAddress: '',
    count: 0,
    popover: true,
  };

  queryParams: {
    offset: number;
    label: number | string;
  } = {
    offset: 0,
    label: '',
  };

  pageSize = 20;
  contractTransaction = { count: 0 };
  contractAddress = '';
  label = null;
  nextKey = null;
  currentKey = null;
  timerGetUpTime: any;
  isLoadingTX = true;
  lengthTxsExecute = 0;
  currentPage = 0;
  destroyed$ = new Subject<void>();
  modeTxType = { Out: 0, In: 1, Instantiate: 2 };
  payload = {
    limit: 100,
  };
  errTxt: string;
  EWalletType = EWalletType;
  coinInfo = this.environmentService.chainInfo.currencies[0];

  constructor(
    public translate: TranslateService,
    private router: Router,
    private environmentService: EnvironmentService,
    private route: ActivatedRoute,
    private transactionService: TransactionService,
  ) {
    const valueColumn = this.templates.find((item) => item.matColumnDef === 'value');

    valueColumn &&
      ((v) => {
        v.suffix =
          `<span class="text--primary">` + this.environmentService.chainInfo.currencies[0].coinDenom + `</span>`;
      })(valueColumn);
  }

  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.paramMap.get('addressId');

    this.payload['value'] = this.contractAddress;
    this.contractInfo.contractsAddress = this.contractAddress;
    this.getData();
    this.timerGetUpTime = setInterval(() => {
      this.errTxt = null;
      // reload when page = 0
      if (this.currentPage === 0) {
        this.currentKey = null;
        this.getData(true);
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

  getData(isReload = false) {
    this.route.queryParams.subscribe((params) => {
      if (params['label']) {
        this.label = params['label'] || this.modeTxType.Out;
      }
      if (this.label == 0) {
        this.getListOutgoing(isReload);
      } else {
        this.payload['compositeKey'] = 'execute._contract_address';
        this.getDataTable(null, isReload);
      }
    });
  }

  getDataTable(nextKey = null, isReload = false) {
    if (+this.label === this.modeTxType.Out && this.label) {
      this.isLoadingTX = false;
      return;
    }

    this.payload['heightLT'] = nextKey;
    if (this.contractAddress.startsWith(EWalletType.EVM)) {
      this.payload['address'] = this.contractAddress.toLowerCase();
      this.templates = EVM_CONTRACT_TABLE_TEMPLATES;
      this.transactionService
        .getListEvmContractTxByAddress(this.payload)
        .pipe(
          map((txsRes) => {
            if (txsRes?.evm_transaction?.length > 0) {
              return txsRes.evm_transaction.map((tx) => {
                const type = getFunctionNameByMethodId(_.get(tx, 'data')?.substring(0, 8));
                return {
                  ...tx,
                  tx_hash: _.get(tx, 'hash'),
                  hash: _.get(tx, 'transaction.hash'),
                  method: type,
                  from: _.get(tx, 'from'),
                  to: _.get(tx, 'to'),
                  timestamp: _.get(tx, 'transaction.timestamp'),
                  evmAmount: _.get(tx, 'transaction.transaction_messages[0].content.data.value'),
                };
              });
            }
            return [];
          }),
        )
        .subscribe({
          next: (res) => {
            this.contractTransaction['data'] = res;
            this.contractTransaction['count'] = this.contractTransaction['data'].length || 0;
          },
          error: (e) => {
            if (e.name === TIMEOUT_ERROR) {
              this.errTxt = e.message;
            } else {
              this.errTxt = e.status + ' ' + e.statusText;
            }
            this.isLoadingTX = false;
          },
          complete: () => {
            this.isLoadingTX = false;
          },
        });
    } else {
      this.transactionService.getListTxCondition(this.payload).subscribe({
        next: (data) => {
          if (data) {
            this.getListData(data, isReload);
          }
        },
        error: (e) => {
          if (e.name === TIMEOUT_ERROR) {
            this.errTxt = e.message;
          } else {
            this.errTxt = e.status + ' ' + e.statusText;
          }
          this.isLoadingTX = false;
        },
        complete: () => {
          this.isLoadingTX = false;
        },
      });
    }
  }

  getListOutgoing(isReload = false) {
    this.payload['actionEq'] = 'execute';
    this.transactionService.getListOutgoing(this.payload).subscribe({
      next: (data) => {
        if (data) {
          this.getListData(data, isReload);
        }
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.isLoadingTX = false;
      },
      complete: () => {
        this.isLoadingTX = false;
      },
    });
  }

  getListData(data, isReload = false) {
    const txsExecute = convertDataTransaction(data, this.coinInfo);
    if (data.transaction?.length > 0) {
      this.nextKey = null;
      if (txsExecute.length >= 100) {
        this.nextKey = data?.transaction[txsExecute.length - 1].height;
      }
      if (this.contractTransaction['data']?.length > 0 && !isReload) {
        this.contractTransaction['data'] = [...this.contractTransaction['data'], ...txsExecute];
      } else if (txsExecute.length > 0) {
        this.contractTransaction['data'] = txsExecute;
      }
      this.lengthTxsExecute = txsExecute.length;
    }
    this.contractTransaction['count'] = this.contractTransaction['data']?.length;
  }

  onChangePage(event) {
    const { pageIndex, pageSize } = event;
    this.currentPage = pageIndex;
    const next = event.length <= (pageIndex + 2) * pageSize;
    if (next && this.nextKey && this.currentKey !== this.nextKey) {
      this.getDataTable(this.nextKey);
      this.currentKey = this.nextKey;
    }
  }

  filterTransaction(event): void {
    if (event?.key) {
      this.router.navigate([`/contracts/transactions/${this.contractAddress}`], {
        queryParams: {
          label: event.key,
        },
      });
    } else {
      this.router.navigate([`/contracts/transactions/${this.contractAddress}`]);
    }
  }
}
