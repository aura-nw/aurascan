import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { NULL_ADDRESS, NUMBER_CONVERT } from '../core/constants/common.constant';
import { TYPE_TRANSACTION } from '../core/constants/transaction.constant';
import {
  CodeTransaction,
  ModeExecuteTransaction,
  StatusTransaction,
  TRANSACTION_TYPE_ENUM,
} from '../core/constants/transaction.enum';
import { CommonDataDto } from '../core/models/common.model';
import { balanceOf } from '../core/utils/common/parsing';

Injectable();

export class Globals {
  dataHeader = new CommonDataDto();
  formatNumberToken = '1.6-6';
  formatNumber2Decimal = '1.2-2';
  formatNumberOnlyDecimal = '1.0-0';
  maxNumberInput = 100000000000000;
  price = {
    aura: 0,
    btc: 0,
  };
}

export function getAmount(arrayMsg, type, rawRog = '', coinMinimalDenom = '') {
  let amount = 0;
  let amountFormat;
  let eTransType = TRANSACTION_TYPE_ENUM;

  //check is ibc
  if (type.indexOf('ibc') > -1) {
    arrayMsg.forEach((element) => {
      if (element['@type'] != eTransType.IBCUpdateClient) {
        switch (element['@type']) {
          case eTransType.IBCReceived:
            let dataEncode = atob(element?.packet?.data);
            try {
              const data = JSON.parse(dataEncode);
              amountFormat = balanceOf(data.amount);
            } catch (e) {
              amountFormat = null;
            }
            break;
          case eTransType.IBCTransfer:
            amountFormat = balanceOf(element.token.amount);
            break;
          default:
            return amountFormat;
        }
      }
    });
    return amountFormat;
  }

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
        itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.owner ||
        itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.spender ||
        itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.operator;
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

export function convertDataTransaction(data, coinDecimals, coinMinimalDenom) {
  const txs = _.get(data, 'transactions').map((element) => {
    const code = _.get(element, 'tx_response.code');
    const tx_hash = _.get(element, 'tx_response.txhash');
    const messages = _.get(element, 'tx_response.tx.body.messages');

    const _type = _.get(element, 'tx_response.tx.body.messages[0].@type');
    const type = _.find(TYPE_TRANSACTION, { label: _type })?.value;

    const status =
      _.get(element, 'tx_response.code') == CodeTransaction.Success
        ? StatusTransaction.Success
        : StatusTransaction.Fail;

    const _amount = getAmount(
      _.get(element, 'tx_response.tx.body.messages'),
      _type,
      _.get(element, 'tx_response.tx.body.raw_log'),
      coinMinimalDenom,
    );

    const amount = _.isNumber(_amount) && _amount > 0 ? _amount.toFixed(coinDecimals) : _amount;

    const fee = balanceOf(_.get(element, 'tx_response.tx.auth_info.fee.amount[0].amount') || 0, coinDecimals).toFixed(
      coinDecimals,
    );
    const height = _.get(element, 'tx_response.height');
    const timestamp = _.get(element, 'tx_response.timestamp');
    const gas_used = _.get(element, 'tx_response.gas_used');
    const gas_wanted = _.get(element, 'tx_response.gas_wanted');

    return { code, tx_hash, type, status, amount, fee, height, timestamp, gas_used, gas_wanted, messages };
  });
  return txs;
}

export function convertDataBlock(data) {
  const block = _.get(data, 'blocks').map((element) => {
    const height = _.get(element, 'block.header.height');
    const block_hash = _.get(element, 'block_id.hash');
    const num_txs = _.get(element, 'block.data.txs.length');
    const proposer = _.get(element, 'validator_name');
    const operator_address = _.get(element, 'operator_address');
    const timestamp = _.get(element, 'block.header.time');

    return { height, block_hash, num_txs, proposer, operator_address, timestamp };
  });
  return block;
}
