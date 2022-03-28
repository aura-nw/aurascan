import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { TRANSACTION_TYPE_ENUM } from '../../../../../app/core/constants/transaction.enum';
import { NUMBER_CONVERT } from '../../../../../app/core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../../../app/core/constants/transaction.constant';

@Component({
  selector: 'app-transferred-detail',
  templateUrl: './transferred-detail.component.html',
  styleUrls: ['./transferred-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TransferredDetailComponent implements OnInit {
  typeTransaction = TYPE_TRANSACTION;
  transactionDetailType;
  eTransType = TRANSACTION_TYPE_ENUM;
  amount;
  @Input() transactionDetail: any;

  constructor() { }

  ngOnInit(): void {
    const typeTrans = this.typeTransaction.find(f => f.label.toLowerCase() === this.transactionDetail?.type.toLowerCase());
    this.transactionDetailType = typeTrans?.value;
    let amount = 0;
    let itemMessage = this.transactionDetail?.messages[0];

    if (itemMessage?.amount && (this.transactionDetail?.type === this.eTransType.Undelegate 
      || this.transactionDetail?.type === this.eTransType.Delegate)) {
      amount = itemMessage?.amount.amount;
    } else if (itemMessage?.amount) {
      amount = itemMessage?.amount[0].amount;
    } else if (itemMessage?.funds) {
      amount = itemMessage?.funds[0].amount;
    }

    if (this.transactionDetail?.messages && amount) {
      amount = amount / NUMBER_CONVERT;
      this.amount = this.transactionDetail?.messages?.length === 1 ? amount : 'More';
    }
  }
}
