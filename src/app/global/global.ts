import { Injectable } from '@angular/core';
import { NULL_ADDRESS, NUMBER_CONVERT } from '../core/constants/common.constant';
import { ModeExecuteTransaction, TRANSACTION_TYPE_ENUM } from '../core/constants/transaction.enum';
import { CommonDataDto } from '../core/models/common.model';

Injectable();

export class Globals {
  dataHeader = new CommonDataDto();
  formatNumberToken = '1.6-6';
  formatNumber2Decimal = '1.2-2';
  formatNumberOnlyDecimal = '1.0-0';
  maxNumberInput = 100000000000000;
  price = {
    aura: 0,
    btc: 0
  }
}

export function getAmount(arrayMsg, type, rawRog = '', coinMinimalDenom = '') {
  let amount = 0;
  let amountFormat;
  let eTransType = TRANSACTION_TYPE_ENUM;
  let itemMessage = arrayMsg[0];

  try {
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
      amount =
        itemMessage?.initial_deposit[0]?.amount ||
        itemMessage?.content?.amount[0].amount ||
        itemMessage?.amount[0].amount ||
        0;
    } else if (type === eTransType.CreateValidator) {
      amount = itemMessage?.value?.amount || 0;
    } else if (type === eTransType.GetReward && arrayMsg.length === 1) {
      //check error with rawlog
      try {
        const jsonData = JSON.parse(rawRog);
        amount = jsonData[0].events[0].attributes[1].value.replace(coinMinimalDenom, '');
      } catch {}
    }
  } catch {}

  if (itemMessage && amount >= 0) {
    amount = amount / NUMBER_CONVERT || 0;
    amountFormat = arrayMsg.length === 1 || type === TRANSACTION_TYPE_ENUM.GetReward ? amount : 'More';
    if (arrayMsg.length > 1 && type === TRANSACTION_TYPE_ENUM.GetReward) {
      amountFormat = 'More';
    }
  }

  return amountFormat;
}

export function getDataInfo(arrayMsg, addressContract) {
  let itemMessage = arrayMsg[0];
  let fromAddress = '',
    toAddress = '';
  let method = '';
  let value = 0;
  let tokenId = '';
  let modeExecute = ModeExecuteTransaction.Default;
  let eTransType = TRANSACTION_TYPE_ENUM;
  switch (itemMessage['@type']) {
    case eTransType.InstantiateContract:
      fromAddress = itemMessage.sender;
      toAddress =
        itemMessage.msg?.minter ||
        itemMessage.contract_address ||
        itemMessage.msg?.initial_balances[0]?.address ||
        itemMessage.msg?.mint?.minter;
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
      method = Object.keys(itemMessage.msg)[0];
      value = itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.amount || 0;
      fromAddress = itemMessage.sender;
      toAddress =
        itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.recipient ||
        itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.owner;
      tokenId = itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.token_id || '';
      if (method === ModeExecuteTransaction.Burn) {
        toAddress = NULL_ADDRESS;
        modeExecute = ModeExecuteTransaction.Burn;
      }
      if (method === ModeExecuteTransaction.Mint) {
        fromAddress = NULL_ADDRESS;
        modeExecute = ModeExecuteTransaction.Mint;
      }
      break;
    case eTransType.Deposit:
      fromAddress = itemMessage.depositor;
      toAddress = addressContract;
      break;
    case eTransType.SubmitProposalTx:
      fromAddress = itemMessage.proposer;
      toAddress = itemMessage?.content.recipient;
      break;
    case eTransType.Redelegate:
      fromAddress = itemMessage.delegator_address;
      toAddress = itemMessage.validator_dst_address;
      break;
    case eTransType.Undelegate:
      fromAddress = itemMessage.validator_address;
      toAddress = itemMessage.delegator_address;
      break;
    case eTransType.Vote:
      fromAddress = itemMessage.voter;
      toAddress = itemMessage.delegator_address;
      break;
    default:
      fromAddress = itemMessage.from_address;
      toAddress = itemMessage.to_address;
      break;
  }
  return [fromAddress, toAddress, value, method, tokenId, modeExecute];
}
