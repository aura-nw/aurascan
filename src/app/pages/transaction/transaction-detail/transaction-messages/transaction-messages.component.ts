import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AURA_DENOM, DATEFORMAT, NUMBER_CONVERT } from '../../../../core/constants/common.constant';
import { PROPOSAL_VOTE } from '../../../../core/constants/proposal.constant';
import { TYPE_TRANSACTION } from '../../../../core/constants/transaction.constant';
import { TRANSACTION_TYPE_ENUM, TypeTransaction } from '../../../../core/constants/transaction.enum';
import { ValidatorService } from '../../../../core/services/validator.service';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { getAmount, Globals } from 'src/app/global/global';

@Component({
  selector: 'app-transaction-messages',
  templateUrl: './transaction-messages.component.html',
  styleUrls: ['./transaction-messages.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TransactionMessagesComponent implements OnInit {
  @Input() transactionDetail: any;

  typeTransaction = TYPE_TRANSACTION;
  voteConstant = PROPOSAL_VOTE;
  transactionDetailType: TypeTransaction;
  eTransType = TRANSACTION_TYPE_ENUM;
  amount = 0;
  amountClaim = 0;
  storeCodeId = 0;
  dateVesting: string;
  validatorName = '';
  validatorNameDes = '';
  listValidator: any[];
  listAmountClaim = [];
  objMsgContract: any;

  denom = this.environmentService.apiUrl.value.chain_info.currencies[0].coinDenom;
  constructor(
    public global: Globals,
    private datePipe: DatePipe,
    private validatorService: ValidatorService,
    private environmentService: EnvironmentService,
  ) {}

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
    } else if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.StoreCode) {
      this.checkStoreCode();
    } else if (
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.InstantiateContract ||
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.ExecuteContract
    ) {
      this.displayMsgRaw();
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
        if (res.data?.length > 0) {
          this.listValidator = res.data;
          if (this.transactionDetail) {
            const { type, messages } = this.transactionDetail;

            if (type === TRANSACTION_TYPE_ENUM.Redelegate) {
              const validatorSrcAddress = this.listValidator.find(
                (f) => f.operator_address === messages[0]?.validator_src_address,
              );
              this.validatorName = validatorSrcAddress?.title || '';

              const validatorDstAddress = this.listValidator.find(
                (f) => f.operator_address === messages[0]?.validator_dst_address,
              );
              this.validatorNameDes = validatorDstAddress?.title || '';
            } else if (messages?.length > 0) {
              messages.forEach((message) => {
                message.validatorName =
                  this.listValidator.find((f) => f.operator_address === message?.validator_address)?.title || '';
              });
            }
          }
        }
      },
      (_) => {},
    );
  }

  checkGetReward(): void {
    try {
      const jsonData = JSON.parse(this.transactionDetail?.raw_log);
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
                if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Redelegate) {
                  let arrayAmount = data.filter((k) => k.key === 'amount');
                  this.amountClaim = 0;
                  arrayAmount.forEach((element) => {
                    this.amountClaim += Number(element.value.replace(AURA_DENOM, '')) / NUMBER_CONVERT || 0;
                  });
                } else {
                  let amount = data.find((k) => k.key === 'amount').value;
                  this.amountClaim = amount.replace(AURA_DENOM, '') / NUMBER_CONVERT || 0;
                }
              }
              this.transactionDetail?.messages.forEach((message) => {
                const validator = data.find((trans) => trans.key === 'validator')?.value;
                if (validator === message.validator_address) {
                  let amount = data.find((k) => k.key === 'amount').value.replace(AURA_DENOM, '');
                  amount = amount / NUMBER_CONVERT || 0;
                  this.listAmountClaim.push(amount);
                }
              });
            }
          }
        });
      }
    } catch (e) {}
  }

  displayMsgRaw(): void {
    const obj = this.transactionDetail?.tx?.tx?.body?.messages[0];
    this.objMsgContract = Object.keys(obj).reduce((newObj, key) => {
      if (key === 'msg' || key === 'funds') {
        newObj[key] = obj[key];
      }
      return newObj;
    }, {});
  }

  checkStoreCode(): void {
    try {
      const jsonData = JSON.parse(this.transactionDetail?.raw_log);
      if (jsonData && jsonData[0]) {
        const temp = jsonData[0]?.events.filter((f) => f.type === 'store_code');
        if (temp) {
          this.storeCodeId = temp[0]?.attributes[0]?.value || 0;
        }
      }
    } catch (e) {}
  }

  parsingOptionVote(option) {
    const statusObj = this.voteConstant.find((s) => s.key === option);
    if (statusObj !== undefined) {
      return statusObj.value;
    }
    return null;
  }
}
