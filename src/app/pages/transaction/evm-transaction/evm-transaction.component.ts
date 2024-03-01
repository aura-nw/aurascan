import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
import { map, of, switchMap } from 'rxjs';
import { TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { CodeTransaction, StatusTransaction } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { MappingErrorService } from 'src/app/core/services/mapping-error.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { getBalance } from 'src/app/core/utils/common/parsing';
import { convertDataTransaction } from 'src/app/global/global';

@Component({
  selector: 'app-evm-transaction',
  templateUrl: './evm-transaction.component.html',
  styleUrls: ['./evm-transaction.component.scss'],
})
export class EvmTransactionComponent implements OnChanges {
  @Input() txHash = '';
  transaction: {
    evm_hash: string;
    hash: string;
    status: StatusTransaction;
    height: number;
    timestamp: string;
    from: string;
    to: string;
    amount: string;
    gasWanted: string;
    gasUsed: string;
    code: CodeTransaction;
    fee: string;
    memo: string;
    type: string;
    inputData: { [key: string]: unknown };
    eventLog: { [key: string]: unknown };
  };

  transactionDetail;

  codeTransaction = CodeTransaction;
  errorMessage = '';
  errTxt = null;

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  coinInfo = this.environmentService.chainInfo.currencies[0];
  loading = true;
  seeLess = false;
  isDisplayMore = false;

  constructor(
    private transactionService: TransactionService,
    public commonService: CommonService,
    private mappingErrorService: MappingErrorService,
    public environmentService: EnvironmentService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.txHash) {
      this.getDetail();
    }
  }

  getDetail(): void {
    if (this.txHash) {
      const payload = {
        limit: 1,
        hash: this.txHash,
      };

      this.transactionService
        .queryTransactionByEvmHash(payload)
        .pipe(
          switchMap((response) => {
            const txData = _.get(response, 'transaction[0]');
            const linkS3 = _.get(response, 'transaction[0].data.linkS3');

            if (linkS3) {
              return this.transactionService.getRawData(linkS3).pipe(
                map((rawData) => {
                  if (response) {
                    txData.data = rawData;
                  }

                  return txData;
                }),
              );
            }

            return of(txData);
          }),
        )
        .subscribe({
          next: (res) => {
            console.log('🐛 res: ', res);
            if (res) {
              this.transaction = this.parseEvmTx(res);
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
            setTimeout(() => {
              this.loading = false;
            }, 1000);
          },
        });
    } else {
      this.loading = false;
    }
  }

  parseEvmTx(tx: unknown): typeof this.transaction {
    const txBodyMessage: unknown[] = _.get(tx, 'data.tx.body.messages[0]');

    return {
      evm_hash: _.get(tx, 'evm_transaction.hash'),
      hash: tx['hash'],
      status: _.get(tx, 'code') == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail,
      code: _.get(tx, 'code'),
      height: _.get(tx, 'height'),
      timestamp: _.get(tx, 'timestamp'),
      gasUsed: _.get(tx, 'gas_used'),
      gasWanted: _.get(tx, 'gas_wanted'),
      memo: _.get(tx, 'memo'),
      // TODO
      amount: getBalance(_.get(tx, 'fee[0].amount'), 18),
      fee: getBalance(_.get(tx, 'fee[0].amount'), 18),
      from: _.get(tx, 'evm_transaction.from'),
      to: _.get(txBodyMessage, 'data.to'),
      type: txBodyMessage['@type'],
      inputData: {
        hexSignature: _.get(txBodyMessage, 'data.data'),
      },
      eventLog: {
        hexSignature: txBodyMessage['data'],
      },
    };
  }
}
