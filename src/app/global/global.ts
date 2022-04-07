import { Injectable } from '@angular/core';
import { NUMBER_CONVERT } from '../core/constants/common.constant';
import { TRANSACTION_TYPE_ENUM, TypeTransaction } from '../core/constants/transaction.enum';
import { CommonDataDto } from '../core/models/common.model';

Injectable()

export class Globals {
  dataHeader = new CommonDataDto();
  stableToken = 'AURA';
}

export function getAmount(arrayMsg, type) {
  let amount = 0;
  let amountFormat;
  let eTransType = TRANSACTION_TYPE_ENUM;
  let itemMessage = arrayMsg[0];
  
  if (itemMessage?.amount && (type === eTransType.Undelegate 
    || type === eTransType.Delegate)) {
    amount = itemMessage?.amount.amount;
  } else if (itemMessage?.amount) {
    amount = itemMessage?.amount[0].amount;
  } else if (itemMessage?.funds && itemMessage?.funds.length > 0) {
    amount = itemMessage?.funds[0].amount;
  }

  if (itemMessage && amount) {
    amount = amount / NUMBER_CONVERT;
    amountFormat = arrayMsg.length === 1 ? amount : 'More';
  }

  return amountFormat;
}