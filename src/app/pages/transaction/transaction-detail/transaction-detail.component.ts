import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TYPE_TRANSACTION } from '../../../core/constants/transaction.constant';
import { CodeTransaction } from '../../../core/constants/transaction.enum';
import { CommonService } from '../../../core/services/common.service';
import { MappingErrorService } from '../../../core/services/mapping-error.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { convertDataTransaction, Globals } from '../../../global/global';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss'],
})
export class TransactionDetailComponent implements OnInit {
  txHash = '';
  transaction = null;
  codeTransaction = CodeTransaction;
  typeTransaction = TYPE_TRANSACTION;
  isRawData = false;
  errorMessage = '';
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
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  chainId = this.environmentService.configValue.chainId;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinInfo = this.environmentService.configValue.chain_info.currencies[0];
  loading = true;
  isReload = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    public global: Globals,
    public commonService: CommonService,
    private mappingErrorService: MappingErrorService,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    private clipboard: Clipboard,
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
      this.transactionService.txsIndexer(1, 0, this.txHash).subscribe(
        (res) => {
          const { code, data } = res;
          if (code === 200 && data.transactions?.length > 0) {
            const txs = convertDataTransaction(data, this.coinInfo);
            this.transaction = txs[0];
            this.transaction = {
              ...this.transaction,
              chainid: this.chainId,
              gas_used: _.get(res?.data.transactions[0], 'tx_response.gas_used'),
              gas_wanted: _.get(res?.data.transactions[0], 'tx_response.gas_wanted'),
              raw_log: _.get(res?.data.transactions[0], 'tx_response.raw_log'),
              type: _.get(res?.data.transactions[0], 'tx_response.tx.body.messages[0].@type'),
              tx: _.get(res?.data.transactions[0], 'tx_response'),
            };

            if (this.transaction.raw_log && +this.transaction.code !== CodeTransaction.Success) {
              this.errorMessage = this.transaction.raw_log;
              this.errorMessage = this.mappingErrorService.checkMappingErrorTxDetail(
                this.errorMessage,
                this.transaction.code,
              );
            }
          } else {
            setTimeout(() => {
              this.getDetail();
              this.isReload = true;
            }, 10000);
          }
        },
        () => {},
        () => {
          this.loading = false;
        },
      );
    }
  }

  changeType(type: boolean): void {
    this.isRawData = type;
  }

  copyData(text: string): void {
    var dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    this.clipboard.copy(JSON.stringify(text, null, 2));
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    // fake event click out side copy button
    // this event for hidden tooltip
    setTimeout(function () {
      document.getElementById('popupCopy').click();
    }, 800);
  }
}
