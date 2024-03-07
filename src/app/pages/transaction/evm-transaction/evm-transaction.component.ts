import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
import { of, switchMap } from 'rxjs';
import { TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { CodeTransaction, StatusTransaction } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { getBalance, toHexData } from 'src/app/core/utils/common/parsing';

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
    gas_limit: string;
    code: CodeTransaction;
    fee: string;
    memo: string;
    type: string;
    inputData: { [key: string]: string };
    eventLog: {
      id: number;
      contractName?: string;
      contract?: string;
      topics?: {
        address: string;
        data: string;
      }[];
      data?: {
        value: string;
        hexValue: string;
      };
    }[];
  };

  codeTransaction = CodeTransaction;
  errorMessage = '';
  errTxt = null;

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  coinInfo = this.environmentService.chainInfo.currencies[0];
  chainName = this.environmentService.chainName;

  loading = true;
  seeLess = false;
  isDisplayMore = false;

  constructor(
    private transactionService: TransactionService,
    public commonService: CommonService,
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

            return of(txData);
          }),
        )
        .subscribe({
          next: (res) => {
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
    const txMessage: unknown[] = _.get(tx, 'transaction_messages[0]');

    const inputData = toHexData(_.get(tx, 'evm_transaction.data'))
      ? {
          hexSignature: toHexData(_.get(tx, 'evm_transaction.data')),
        }
      : null;

    return {
      evm_hash: _.get(tx, 'evm_transaction.hash'),
      hash: tx['hash'],
      status: _.get(tx, 'code') == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail,
      code: _.get(tx, 'code'),
      height: _.get(tx, 'height'),
      timestamp: _.get(tx, 'timestamp'),
      gasUsed: _.get(tx, 'gas_used'),
      gasWanted: _.get(tx, 'gas_wanted'),
      gas_limit: _.get(tx, 'gas_limit'),
      memo: _.get(tx, 'memo'),
      amount: getBalance(_.get(tx, 'evm_transaction.value'), this.coinInfo.coinDecimals),
      fee: getBalance(_.get(tx, 'fee[0].amount'), this.coinInfo.coinDecimals),
      from: _.get(txMessage, 'sender'),
      to: _.get(txMessage, 'content.data.to'),
      type: _.get(txMessage, 'content.@type'),
      inputData,
      eventLog: [],
    };

    /* 
      eventLog: [
        {
          id: 1,
          contract: '0xa58963d4224fb4a9fcb6b254b6d62e4922f7f71121679bffdb6a7b0c1d5d8a9f',
          contractName: 'Contract Name',
          data: {
            hexValue: '0xa58963d4224fb4a9fcb6b254b6d62e4922f7f71121679bffdb6a7b0c1d5d8a9f',
            value: '0',
          },
          topics: [
            {
              address: '0xa58963d4224fb4a9fcb6b254b6d62e4922f7f71121679bffdb6a7b0c1d5d8a9f',
              data: '0xa58963d4224fb4a9fcb6b254b6d62e4922f7f71121679bffdb6a7b0c1d5d8a9f',
            },
          ],
        },
      ],
     
    */
  }
}