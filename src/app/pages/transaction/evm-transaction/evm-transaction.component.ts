import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TxResponse } from 'cosmjs-types/cosmos/base/abci/v1beta1/abci';
import * as _ from 'lodash';
import { map, of, switchMap } from 'rxjs';
import { LENGTH_CHARACTER, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { CodeTransaction, StatusTransaction } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { MappingErrorService } from 'src/app/core/services/mapping-error.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { convertDataTransaction } from 'src/app/global/global';

@Component({
  selector: 'app-evm-transaction',
  templateUrl: './evm-transaction.component.html',
  styleUrls: ['./evm-transaction.component.scss'],
})
export class EvmTransactionComponent implements OnChanges {
  @Input() txHash = '';
  transaction;
  // : {
  //   evm_hash: string;
  //   hash: string;
  //   status: StatusTransaction;
  //   height: number;
  //   time: string | Date;
  //   from: string;
  //   to: string;
  //   amount: string;
  //   txFee: string;
  //   gasLimit: string;
  //   gasUsed: string;
  // };

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
            const linkS3 = _.get(response, 'transaction[0]');

            if (linkS3 && false) {
              return this.transactionService.getRawData(linkS3).pipe(
                map((rawData) => {
                  txData.transaction[0].data = rawData;
                  return txData;
                }),
              );
            }

            return of(txData);
          }),
        )
        .subscribe({
          next: (res) => {
            if (res) {
              this.transaction = res;
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

  parseEvmTx(data) {
    return {
      evm_hash: data?.evm_transaction?.hash,
      hash: data?.hash,
      status: _.get(data, 'code') == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail,
      height: data?.height,
      time: data?.timestamp,
      from: data?.hash,
      to: data?.hash,
      amount: data?.hash,
      txFee: data?.hash,
      gasLimit: data?.hash,
      gasUsed: data?.hash,
    };
  }
}
