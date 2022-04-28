import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../../app/core/services/common.service';
import { DATEFORMAT, NUMBER_CONVERT } from '../../../../app/core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../../app/core/constants/transaction.constant';
import {
  CodeTransaction,
  StatusTransaction,
  TRANSACTION_TYPE_ENUM,
  TypeTransaction,
} from '../../../../app/core/constants/transaction.enum';
import { ResponseDto } from '../../../../app/core/models/common.model';
import { TransactionService } from '../../../../app/core/services/transaction.service';
import { Globals } from '../../../../app/global/global';
import { MappingErrorService } from '../../../../app/core/services/mapping-error.service';

@Component({
  selector: 'app-txs-detail',
  templateUrl: './txs-detail.component.html',
  styleUrls: ['./txs-detail.component.scss'],
})
export class TxsDetailComponent implements OnInit {
  txHash = '';
  transaction = null;
  codeTransaction = CodeTransaction;
  typeTransaction = TYPE_TRANSACTION;
  transactionDetailType: TypeTransaction;
  dateFormat: string;
  amount: string | number;
  isRawData = false;
  jsonStr: string;
  eTransType = TRANSACTION_TYPE_ENUM;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private datePipe: DatePipe,
    public global: Globals,
    public commonService: CommonService,
    private mappingErrorService: MappingErrorService,
  ) {}

  ngOnInit(): void {
    this.txHash = this.route.snapshot.paramMap.get('id');
    this.getDetail();
  }

  getDetail(): void {
    this.transactionService.txsDetail(this.txHash).subscribe(
      (res: ResponseDto) => {
        res.data.status = StatusTransaction.Fail;
        if (res.data.code === CodeTransaction.Success) {
          res.data.status = StatusTransaction.Success;
        }
        const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === res.data.type.toLowerCase());
        this.transactionDetailType = typeTrans?.value;
        this.transaction = res.data;

        if (this.transaction.raw_log && this.transaction.code !== CodeTransaction.Success) {
          this.errorMessage = this.transaction.raw_log;
          this.errorMessage = this.mappingErrorService.checkMappingError(this.errorMessage, this.transaction.code);
        }

        //convert json for display raw data
        this.jsonStr = JSON.stringify(this.transaction.tx, null, 2).replace(/\\/g, '');
        this.dateFormat = this.datePipe.transform(this.transaction?.timestamp, DATEFORMAT.DATETIME_UTC);
        //check exit amount of transaction
        if (this.transaction.messages && this.transaction.messages[0]?.amount) {
          let amount = this.transaction.messages[0]?.amount[0]?.amount / NUMBER_CONVERT;
          this.amount = this.transaction.messages?.length === 1 ? amount : 'More';
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
