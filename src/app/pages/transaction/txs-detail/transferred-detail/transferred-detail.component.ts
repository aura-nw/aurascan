import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { TRANSACTION_TYPE_ENUM } from '../../../../../app/core/constants/transaction.enum';
import { TYPE_TRANSACTION } from '../../../../../app/core/constants/transaction.constant';
import { getAmount, Globals } from '../../../../../app/global/global';
import { DatePipe } from '@angular/common';
import { DATEFORMAT, NUMBER_CONVERT } from '../../../../../app/core/constants/common.constant';
import { ValidatorService } from '../../../../../app/core/services/validator.service';
import { PROPOSAL_VOTE } from '../../../../core/constants/proposal.constant';

@Component({
  selector: 'app-transferred-detail',
  templateUrl: './transferred-detail.component.html',
  styleUrls: ['./transferred-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TransferredDetailComponent implements OnInit {
  typeTransaction = TYPE_TRANSACTION;
  voteConstant = PROPOSAL_VOTE;
  transactionDetailType;
  eTransType = TRANSACTION_TYPE_ENUM;
  amount;
  dateVesting;
  isVestingDelay;
  validatorName = '';
  listValidator;
  @Input() transactionDetail: any;

  constructor(public global: Globals, private datePipe: DatePipe, private validatorService: ValidatorService) {}

  ngOnInit(): void {
    if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Vesting) {
      let date = new Date(Number(this.transactionDetail?.messages[0]?.end_time) * 1000);
      this.dateVesting = this.datePipe.transform(date, DATEFORMAT.DATETIME_UTC);
    }
    if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Delegate || this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.GetReward) {
      this.getListValidator();
    }
    //get amount of transaction
    this.amount = getAmount(this.transactionDetail?.messages, this.transactionDetail?.type, this.transactionDetail?.raw_log);
    const typeTrans = this.typeTransaction.find(
      (f) => f.label.toLowerCase() === this.transactionDetail?.type.toLowerCase(),
    );
    this.transactionDetailType = typeTrans?.value;
  }

  getListValidator(): void {
    this.validatorService.validators().subscribe(
      (res) => {
        this.listValidator = res.data;
        if (this.transactionDetail?.messages && this.transactionDetail?.messages.length === 1) {
          let validMap = this.listValidator.find(f => f.operator_address === this.transactionDetail?.messages[0]?.validator_address);
          this.validatorName = validMap.title || '';
        } else if (this.transactionDetail?.messages && this.transactionDetail?.messages.length > 1) { 
          this.transactionDetail?.messages.forEach(message => {
            message.validatorName = this.listValidator.find(f => f.operator_address === message?.validator_address).title || '';
            // const jsonData = JSON.parse(this.transactionDetail.raw_log);
            // console.log(jsonData);
            // let amount = jsonData[0].events[0].attributes[1].value.replace('uaura','');
            // message.amount = amount;
            // message.amount = message?.amount.amount;
          });
        }
      },
      (error) => {},
    );
  }

  parsingOptionVote(option) {
    const statusObj = this.voteConstant.find((s) => s.key === option);
    if (statusObj !== undefined) {
      return statusObj.value;
    }
    return null;
  }
}
