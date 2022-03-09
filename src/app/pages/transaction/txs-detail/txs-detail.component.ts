import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DATEFORMAT } from 'src/app/core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../../app/core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction } from '../../../../app/core/constants/transaction.enum';
import { ResponseDto } from '../../../../app/core/models/common.model';
import { TransactionService } from '../../../../app/core/services/transaction.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-txs-detail',
  templateUrl: './txs-detail.component.html',
  styleUrls: ['./txs-detail.component.scss']
})
export class TxsDetailComponent implements OnInit {
  id;
  item;
  breadCrumbItems = [
    { label: 'Transaction' },
    { label: 'List' },
    { label: 'Detail', active: true }
  ];
  codeTransaction = CodeTransaction;
  typeTransaction = TYPE_TRANSACTION;
  transactionDetailType;
  dateFormat;
  amount = 0;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getDetail();
  }
  getDetail(): void {
    this.transactionService
      .txsDetail(this.id)
      .subscribe((res: ResponseDto) => {
        const typeTrans = this.typeTransaction.find(f => f.label === res.data.type);
        this.transactionDetailType = typeTrans?.value;
        res.data.status = res.data.code === CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;
        this.item = res.data;
        this.dateFormat = this.datePipe.transform(this.item?.timestamp, DATEFORMAT.DATETIME_UTC);
        //check exit amount of transaction
        if (this.item.messages && this.item.messages[0]?.amount) {
          this.amount = this.item.messages?.length === 1 ? this.item.messages[0]?.amount[0]?.amount : 'More';
        }
      },
        error => {
          this.router.navigate(['/']);
        }
      );
  }
}
