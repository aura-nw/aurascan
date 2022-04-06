import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { TRANSACTION_TYPE_ENUM } from '../../../../../app/core/constants/transaction.enum';
import { TYPE_TRANSACTION } from '../../../../../app/core/constants/transaction.constant';
import { getAmount, Globals } from '../../../../../app/global/global';

@Component({
  selector: 'app-transferred-detail',
  templateUrl: './transferred-detail.component.html',
  styleUrls: ['./transferred-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TransferredDetailComponent implements OnInit {
  typeTransaction = TYPE_TRANSACTION;
  transactionDetailType;
  eTransType = TRANSACTION_TYPE_ENUM;
  amount;
  @Input() transactionDetail: any;

  constructor(public global: Globals) {}

  ngOnInit(): void {
    //get amount of transaction
    this.amount = getAmount(this.transactionDetail?.messages, this.transactionDetail?.type);
    const typeTrans = this.typeTransaction.find(
      (f) => f.label.toLowerCase() === this.transactionDetail?.type.toLowerCase(),
    );
    this.transactionDetailType = typeTrans?.value;
  }
}
