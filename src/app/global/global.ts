import { Injectable } from '@angular/core';
import { NUMBER_CONVERT, STABLE_UTOKEN } from '../core/constants/common.constant';
import { TRANSACTION_TYPE_ENUM } from '../core/constants/transaction.enum';
import { CommonDataDto } from '../core/models/common.model';

Injectable()

export class Globals {
  dataHeader = new CommonDataDto();
  stableToken = 'AURA';
  formatNumberToken = '1.6-6';
  formatNumber2Decimal = '1.2-2';
  formatNumberOnlyDecimal = '1.0-0';
  maxNumberInput = 100000000000000;
}

export function getAmount(arrayMsg, type, rawRog = '') {
  let amount = 0;
  let amountFormat;
  let eTransType = TRANSACTION_TYPE_ENUM;
  let itemMessage = arrayMsg[0];
  
  if (itemMessage?.amount && (type === eTransType.Undelegate 
    || type === eTransType.Delegate || type === eTransType.Redelegate)) {
    amount = itemMessage?.amount.amount;
  } else if (itemMessage?.amount) {
    amount = itemMessage?.amount[0].amount;
  } else if (itemMessage?.funds && itemMessage?.funds.length > 0) {
    amount = itemMessage?.funds[0].amount;
  } else if (type === eTransType.SubmitProposalTx){
    amount = itemMessage?.initial_deposit[0]?.amount || 0;
  } else if (type === TRANSACTION_TYPE_ENUM.GetReward && arrayMsg.length === 1) {
    //check error with rawlog
    try {
      const jsonData = JSON.parse(rawRog);
      amount = jsonData[0].events[0].attributes[1].value.replace(STABLE_UTOKEN,'');
    } catch {
    }
  }

  if (itemMessage && amount >= 0) {
    amount = (amount / NUMBER_CONVERT) || 0;
    amountFormat = (arrayMsg.length === 1 || type === TRANSACTION_TYPE_ENUM.GetReward) ? amount : 'More';
    if(arrayMsg.length > 1 && type === TRANSACTION_TYPE_ENUM.GetReward){
      amountFormat = 'More';
    }
  }

  return amountFormat;
}