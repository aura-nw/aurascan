import { Injectable } from '@angular/core';
import { NUMBER_CONVERT } from '../core/constants/common.constant';
import { TRANSACTION_TYPE_ENUM } from '../core/constants/transaction.enum';
import { CommonDataDto } from '../core/models/common.model';

Injectable();

export class Globals {
  dataHeader = new CommonDataDto();
  formatNumberToken = '1.6-6';
  formatNumber2Decimal = '1.2-2';
  formatNumberOnlyDecimal = '1.0-0';
  maxNumberInput = 100000000000000;
}

export function getAmount(arrayMsg, type, rawRog = '', coinMinimalDenom: string) {
  let amount = 0;
  let amountFormat;
  let eTransType = TRANSACTION_TYPE_ENUM;
  let itemMessage = arrayMsg[0];

  if (
    itemMessage?.amount &&
    (type === eTransType.Undelegate || type === eTransType.Delegate || type === eTransType.Redelegate)
  ) {
    amount = itemMessage?.amount.amount;
  } else if (itemMessage?.amount) {
    amount = itemMessage?.amount[0].amount;
  } else if (itemMessage?.funds && itemMessage?.funds.length > 0) {
    amount = itemMessage?.funds[0].amount;
  } else if (type === eTransType.SubmitProposalTx) {
    amount = itemMessage?.initial_deposit[0]?.amount || 0;
  } else if (type === eTransType.CreateValidator) {
    amount = itemMessage?.value?.amount || 0;
  } else if (type === eTransType.GetReward && arrayMsg.length === 1) {
    //check error with rawlog
    try {
      const jsonData = JSON.parse(rawRog);
      amount = jsonData[0].events[0].attributes[1].value.replace(coinMinimalDenom, '');
    } catch {}
  }

  if (itemMessage && amount >= 0) {
    amount = amount / NUMBER_CONVERT || 0;
    amountFormat = arrayMsg.length === 1 || type === TRANSACTION_TYPE_ENUM.GetReward ? amount : 'More';
    if (arrayMsg.length > 1 && type === TRANSACTION_TYPE_ENUM.GetReward) {
      amountFormat = 'More';
    }
  }

  return amountFormat;
}

export function getAddress(arrayMsg, addressContract) {
  let itemMessage = arrayMsg[0];
  let fromAddress = '',
    toAddress = '';
  let eTransType = TRANSACTION_TYPE_ENUM;
  switch (itemMessage['@type']) {
    case eTransType.InstantiateContract:
      fromAddress = itemMessage.sender;
      toAddress = itemMessage.msg?.minter || itemMessage.msg?.initial_balances[0]?.address;
      break;
    case eTransType.Delegate:
      fromAddress = itemMessage.delegator_address;
      toAddress = itemMessage.validator_address;
      break;
    case eTransType.GetReward:
      fromAddress = itemMessage.validator_address;
      toAddress = itemMessage.delegator_address;
      break;
    case eTransType.StoreCode:
      fromAddress = itemMessage.sender;
      toAddress = addressContract;
      break;
    case eTransType.ExecuteContract:
      console.log(itemMessage);
      
      fromAddress = itemMessage.sender;
      toAddress = itemMessage.contract;
      break;
    default:
      fromAddress = itemMessage.from_address;
      toAddress = itemMessage.to_address;
      break;
  }

  return [fromAddress, toAddress];
}