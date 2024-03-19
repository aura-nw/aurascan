import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
import { of, switchMap } from 'rxjs';
import { TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { CodeTransaction, StatusTransaction } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { getBalance } from 'src/app/core/utils/common/parsing';

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
    evm_data: string;
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
  topicLength = 4;

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
            console.log(response);

            const txData = _.get(response, 'transaction[0]');

            return of(txData);
          }),
        )
        .subscribe({
          next: (res) => {
            if (res) {
              this.transaction = this.parseEvmTx(res);
              console.log(this.transaction);
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
    let evm_events = _.get(tx, 'evm_transaction.evm_events');

    if (evm_events?.length > 0) {
      evm_events.forEach((element) => {
        let topics = [];
        let evm_signature_mapping_topic = [];
        for (let i = 0; i < this.topicLength; i++) {
          topics.push(element['topic' + i]);
          if (element[`evm_signature_mapping_topic${[i]}`]) {
            console.log(element[`evm_signature_mapping_topic${[i]}`]);
            if (element[`evm_signature_mapping_topic${[i]}`]['human_readable_topic']) {
              let human_readable_topic = element[`evm_signature_mapping_topic${[i]}`]['human_readable_topic']
                ?.toString()
                .replace('event', '>');
              evm_signature_mapping_topic.push(human_readable_topic);
            }
          }
        }
        element['topics'] = topics;
        element['evm_signature_mapping_topic'] = evm_signature_mapping_topic;
      });
    }

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
      inputData: _.get(tx, 'evm_transaction.data'),
      eventLog: evm_events,
      evm_data: _.get(tx, 'evm_transaction.data'),
    };
  }
}
