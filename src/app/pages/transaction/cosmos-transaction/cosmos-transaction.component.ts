import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
import { LENGTH_CHARACTER, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { CodeTransaction } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { MappingErrorService } from 'src/app/core/services/mapping-error.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { convertDataTransaction } from 'src/app/global/global';

@Component({
  selector: 'app-cosmos-transaction',
  templateUrl: './cosmos-transaction.component.html',
  styleUrls: ['./cosmos-transaction.component.scss'],
})
export class CosmosTransactionComponent implements OnChanges {
  @Input() txHash = '';

  transaction = null;
  codeTransaction = CodeTransaction;
  isRawData = false;
  errorMessage = '';
  errTxt = null;
  TAB = [
    {
      id: 0,
      value: 'SUMMARY',
    },
    {
      id: 1,
      value: 'JSON',
    },
  ];

  chainId = this.environmentService.chainId;
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
    if (this.txHash?.length === LENGTH_CHARACTER.TRANSACTION) {
      const payload = {
        limit: 1,
        hash: this.txHash,
      };
      this.transactionService.getListTxDetail(payload).subscribe({
        next: (res) => {
          if (res?.transaction?.length > 0) {
            const linkS3 = _.get(res, 'transaction[0].data.linkS3');
            if (linkS3?.length > 0) {
              this.commonService.getRawData(linkS3).subscribe((data) => {
                res.transaction[0]['data'] = data;
                this.handleLoadData(res);
              });
            } else {
              this.handleLoadData(res);
            }
          } else {
            setTimeout(() => {
              this.getDetail();
            }, 10000);
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

  handleLoadData(res) {
    this.loading = false;

    const coinDecimals = this.environmentService.getDecimals();

    const txs = convertDataTransaction(res, coinDecimals);
    if (txs?.length === 0) {
      this.loading = false;
      return;
    }

    this.transaction = txs[0];

    const eventsTx = txs[0]?.tx?.events?.filter((item) => item.type === 'tx');
    let feePayer = '';
    eventsTx?.forEach(
      (item) =>
        item?.attributes?.forEach((attr) => {
          if (attr?.key === 'fee_payer') feePayer = attr?.value;
        }),
    );

    this.transaction = {
      ...this.transaction,
      chainid: this.chainId,
      gas_used: _.get(res, 'transaction[0].gas_used'),
      gas_wanted: _.get(res, 'transaction[0].gas_wanted'),
      raw_log: _.get(res, 'transaction[0].data.tx_response.raw_log'),
      fee_payer: feePayer,
      type: this.transaction.typeOrigin,
    };

    if (this.transaction.raw_log && +this.transaction.code !== CodeTransaction.Success) {
      const lengthValue = 7.1;
      const maxHeightContent = 3;
      this.errorMessage = this.transaction.raw_log;
      this.errorMessage = this.mappingErrorService.checkMappingErrorTxDetail(this.errorMessage, this.transaction.code);

      // get height error box
      setTimeout(() => {
        const lengthChar = document.getElementById('contentError')?.innerText?.length;
        const widthContent = document.getElementById('contentError')?.offsetWidth;

        // cal width text/content
        if (lengthChar * lengthValue > widthContent * maxHeightContent) {
          this.isDisplayMore = true;
        }
      }, 500);
    }
    this.loading = false;
  }

  changeType(type: boolean): void {
    this.isRawData = type;
  }
}

