import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { DATEFORMAT, NUMBER_CONVERT } from '../../../core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction, TypeTransaction } from '../../../core/constants/transaction.enum';
import { ResponseDto } from '../../../core/models/common.model';
import { CommonService } from '../../../core/services/common.service';
import { MappingErrorService } from '../../../core/services/mapping-error.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { Globals } from '../../../global/global';
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";

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
  transactionDetailType: TypeTransaction;
  dateFormat: string;
  amount: string | number;
  isRawData = false;
  errorMessage = '';
  TAB = [
    {
      id: 0,
      value: 'SUMMARY'
    },
    {
      id: 1,
      value: 'JSON'
    }
  ]
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private datePipe: DatePipe,
    public global: Globals,
    public commonService: CommonService,
    private mappingErrorService: MappingErrorService,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.txHash = this.route.snapshot.paramMap.get('id');
    if(!this.txHash || this.txHash === 'null') {
      this.router.navigate(['/']);
    }
    this.getDetail();
  }

  getDetail(): void {
    this.transactionService.txsDetail(this.txHash).subscribe(
      (res: ResponseDto) => {
        if (res?.data) {
          res.data.status = StatusTransaction.Fail;
          if (res?.data?.code === CodeTransaction.Success) {
            res.data.status = StatusTransaction.Success;
          }
          const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === res?.data?.type.toLowerCase());
          this.transactionDetailType = typeTrans?.value;
          this.transaction = res?.data;

          if (this.transaction.raw_log && this.transaction.code !== CodeTransaction.Success) {
            this.errorMessage = this.transaction.raw_log;
            this.errorMessage = this.mappingErrorService.checkMappingError(this.errorMessage, this.transaction.code);
          }
          this.dateFormat = this.datePipe.transform(this.transaction?.timestamp, DATEFORMAT.DATETIME_UTC);
          //check exit amount of transaction
          if (this.transaction.messages && this.transaction.messages[0]?.amount) {
            let amount = this.transaction.messages[0]?.amount[0]?.amount / NUMBER_CONVERT;
            this.amount = this.transaction.messages?.length === 1 ? amount : 'More';
          }
        }
      },
      (_) => {
        this.router.navigate(['/']);
      },
    );
  }

  changeType(type: boolean): void {
    this.isRawData = type;
  }
}
