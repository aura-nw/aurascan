import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { TRANSACTION_TYPE_ENUM } from '../../../../../app/core/constants/transaction.enum';
import { TYPE_TRANSACTION } from '../../../../../app/core/constants/transaction.constant';
import { getAmount, Globals } from '../../../../../app/global/global';
import { DatePipe } from '@angular/common';
import { DATEFORMAT, NUMBER_CONVERT, STABLE_UTOKEN } from '../../../../../app/core/constants/common.constant';
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
  amount = 0;
  amountClaim = 0;
  dateVesting;
  isVestingDelay;
  validatorName = '';
  validatorNameDes = '';
  listValidator;
  listAmountClaim = [];
  @Input() transactionDetail: any;

  constructor(public global: Globals, private datePipe: DatePipe, private validatorService: ValidatorService) {}

  ngOnInit(): void {
    if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Vesting) {
      let date = new Date(Number(this.transactionDetail?.messages[0]?.end_time) * 1000);
      this.dateVesting = this.datePipe.transform(date, DATEFORMAT.DATETIME_UTC);
    }
    if (
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Delegate ||
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.GetReward ||
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Redelegate ||
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Undelegate
    ) {
      this.getListValidator();
      this.checkGetReward();
    }
    //get amount of transaction
    this.amount = getAmount(
      this.transactionDetail?.messages,
      this.transactionDetail?.type,
      this.transactionDetail?.raw_log,
    );
    const typeTrans = this.typeTransaction.find(
      (f) => f.label.toLowerCase() === this.transactionDetail?.type.toLowerCase(),
    );
    this.transactionDetailType = typeTrans?.value;
  }

  getListValidator(): void {
    this.validatorService.validators().subscribe(
      (res) => {
        this.listValidator = res.data;
        if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Redelegate) {
          this.validatorName =
            this.listValidator.find(
              (f) => f.operator_address === this.transactionDetail?.messages[0]?.validator_src_address,
            ).title || '';
          this.validatorNameDes =
            this.listValidator.find(
              (f) => f.operator_address === this.transactionDetail?.messages[0]?.validator_dst_address,
            ).title || '';
        } else if (this.transactionDetail?.messages && this.transactionDetail?.messages.length === 1) {
          let validMap = this.listValidator.find(
            (f) => f.operator_address === this.transactionDetail?.messages[0]?.validator_address,
          );
          this.validatorName = validMap.title || '';
        } else if (this.transactionDetail?.messages && this.transactionDetail?.messages.length > 1) {
          this.transactionDetail?.messages.forEach((message) => {
            message.validatorName =
              this.listValidator.find((f) => f.operator_address === message?.validator_address).title || '';
          });
        }
      },
      (error) => {},
    );
  }

  checkGetReward(): void {
    try {
      const jsonData = JSON.parse(this.transactionDetail.raw_log);
      if (jsonData && jsonData[0]) {
        jsonData.forEach((j) => {
          let rawType = 'transfer';
          if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.GetReward) {
            rawType = 'withdraw_rewards';
          }
          const temp = j?.events.filter((f) => f.type === rawType);
          if (temp) {
            const data = temp[0]?.attributes;
            if (data) {
              if (this.transactionDetail?.type !== TRANSACTION_TYPE_ENUM.GetReward) {
                if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Redelegate){
                  let arrayAmount = data.filter(k => k.key === 'amount');
                  this.amountClaim = 0;
                  arrayAmount.forEach(element => {
                    this.amountClaim += (Number(element.value.replace(STABLE_UTOKEN, '')) / NUMBER_CONVERT) || 0;
                  });
                } else {
                  let amount =  data.find(k => k.key === 'amount').value;
                  this.amountClaim = (amount.replace(STABLE_UTOKEN, '') / NUMBER_CONVERT) || 0;
                }
              }
              this.transactionDetail?.messages.forEach((message) => {
                const validator = data.find((trans) => trans.key === 'validator')?.value;
                if (validator === message.validator_address) {
                  let amount = data.find((k) => k.key === 'amount').value.replace(STABLE_UTOKEN, '');
                  amount = amount / NUMBER_CONVERT || 0;
                  this.listAmountClaim.push(amount);
                }
              });
            }
          }
        });
      }
    } catch (e) {
    }
  }

  parsingOptionVote(option) {
    const statusObj = this.voteConstant.find((s) => s.key === option);
    if (statusObj !== undefined) {
      return statusObj.value;
    }
    return null;
  }
}
