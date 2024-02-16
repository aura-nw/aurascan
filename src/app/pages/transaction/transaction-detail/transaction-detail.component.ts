import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { LENGTH_CHARACTER, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CodeTransaction } from '../../../core/constants/transaction.enum';
import { CommonService } from '../../../core/services/common.service';
import { MappingErrorService } from '../../../core/services/mapping-error.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { convertDataTransaction } from '../../../global/global';
import { balanceOf } from 'src/app/core/utils/common/parsing';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss'],
})
export class TransactionDetailComponent implements OnInit {
  txHash = '';
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
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    public commonService: CommonService,
    private mappingErrorService: MappingErrorService,
    public environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.txHash = this.route.snapshot.paramMap.get('id');
    if (!this.txHash || this.txHash === 'null') {
      this.router.navigate(['/']);
    }
    this.getDetail();
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
        complete: () => {},
      });
    } else {
      this.loading = false;
    }
  }

  handleLoadData(res) {
    const txs = convertDataTransaction(res, this.coinInfo);
    this.transaction = txs[0];
    const fee = balanceOf(_.get(res, 'transaction[0].amount') || 0, this.coinInfo.coinDecimals).toFixed(
      this.coinInfo.coinDecimals,
    );

    this.transaction = {
      ...this.transaction,
      fee,
      chainid: this.chainId,
      gas_used: _.get(res?.transaction[0], 'gas_used'),
      gas_wanted: _.get(res?.transaction[0], 'gas_wanted'),
      raw_log: _.get(res?.transaction[0], 'data.tx_response.raw_log'),
      type: this.transaction.typeOrigin,
    };

    if (this.transaction.raw_log && +this.transaction.code !== CodeTransaction.Success) {
      this.errorMessage = this.transaction.raw_log;
      this.errorMessage = this.mappingErrorService.checkMappingErrorTxDetail(this.errorMessage, this.transaction.code);

      // get height error box
      setTimeout(() => {
        const lengthChar = document.getElementById('contentError')?.innerText?.length;
        const widthContent = document.getElementById('contentError')?.offsetWidth;

        // cal width text/content
        if (lengthChar * 7.1 > widthContent * 3) {
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
