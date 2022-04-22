import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
import { DATEFORMAT, NUMBER_CONVERT } from '../../../../app/core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../../app/core/constants/transaction.constant';
import {
  CodeTransaction,
  StatusTransaction,
  TRANSACTION_TYPE_ENUM
} from '../../../../app/core/constants/transaction.enum';
import { ResponseDto } from '../../../../app/core/models/common.model';
import { TransactionService } from '../../../../app/core/services/transaction.service';
import { Globals } from '../../../../app/global/global';

@Component({
  selector: 'app-txs-detail',
  templateUrl: './txs-detail.component.html',
  styleUrls: ['./txs-detail.component.scss'],
})
export class TxsDetailComponent implements OnInit {
  id;
  item;
  breadCrumbItems = [{ label: 'Transaction' }, { label: 'List' }, { label: 'Detail', active: true }];
  codeTransaction = CodeTransaction;
  typeTransaction = TYPE_TRANSACTION;
  transactionDetailType;
  dateFormat;
  amount;
  isRawData = false;
  jsonStr;
  eTransType = TRANSACTION_TYPE_ENUM;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private datePipe: DatePipe,
    public global: Globals,
    public commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getDetail();
  }

  getDetail(): void {
    this.transactionService.txsDetail(this.id).subscribe(
      (res: ResponseDto) => {
        res.data.status = StatusTransaction.Fail;
        if (res.data.code === CodeTransaction.Success) {
          res.data.status = StatusTransaction.Success;
        }
        const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === res.data.type.toLowerCase());
        this.transactionDetailType = typeTrans?.value;
        this.item = res.data;
        //convert json for display raw data
        this.jsonStr = JSON.stringify(this.item.tx, null, 2).replace(/\\/g, '');
        this.dateFormat = this.datePipe.transform(this.item?.timestamp, DATEFORMAT.DATETIME_UTC);
        //check exit amount of transaction
        if (this.item.messages && this.item.messages[0]?.amount) {
          let amount = this.item.messages[0]?.amount[0]?.amount / NUMBER_CONVERT;
          this.amount = this.item.messages?.length === 1 ? amount : 'More';
        }
      },
      (error) => {
        this.router.navigate(['/']);
      },
    );
  }

  changeType(type: boolean): void {
    this.isRawData = type;
  }
}
