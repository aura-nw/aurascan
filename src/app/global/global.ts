import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LENGTH_CHARACTER, NULL_ADDRESS, NUMBER_CONVERT } from '../core/constants/common.constant';
import { TYPE_TRANSACTION } from '../core/constants/transaction.constant';
import {
  CodeTransaction,
  ModeExecuteTransaction,
  StatusTransaction,
  TRANSACTION_TYPE_ENUM,
  TypeTransaction,
} from '../core/constants/transaction.enum';
import { CommonDataDto } from '../core/models/common.model';
import { balanceOf } from '../core/utils/common/parsing';
import { TabsAccount } from '../core/constants/account.enum';
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
  listNameTag = [];
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
            amountFormat = 'More';
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
    } else if (type === eTransType.ExecuteAuthz) {
      itemMessage?.msgs.forEach((element) => {
        amount += +element?.amount?.amount;
      });
    }
  } catch {}

  if (itemMessage && amount >= 0) {
    amount = amount / NUMBER_CONVERT || 0;
    amountFormat = amount;
    if (
      ((type === TRANSACTION_TYPE_ENUM.GetReward || type === TRANSACTION_TYPE_ENUM.Undelegate) &&
        arrayMsg?.length > 1) ||
      type === TRANSACTION_TYPE_ENUM.MultiSend ||
      type === TRANSACTION_TYPE_ENUM.PeriodicVestingAccount
    ) {
      amountFormat = 'More';
    }
  }

  return amountFormat;
}

export function getDataInfo(arrayMsg, addressContract, rawLog = '') {
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
      method = 'mint';
      itemMessage.msg = itemMessage.msg || '';
      if (typeof itemMessage.msg === 'string') {
        try {
          itemMessage.msg = JSON.parse(itemMessage.msg);
        } catch (e) {}
      }

      if (itemMessage.msg) {
        method = Object.keys(itemMessage.msg)[0];
      }

      value = itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.amount || 0;
      toAddress =
        itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.recipient ||
        itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.owner ||
        itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.spender ||
        itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.to ||
        itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.operator;

      if (arrayMsg?.length > 1 || itemMessage.msg['batch_mint']) {
        tokenId = 'More';
      } else {
        tokenId = itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.token_id || '';
      }

      if (!toAddress) {
        try {
          const json = JSON.parse(rawLog);
          const data = json[0]?.events[json[0]?.events?.length - 1]?.attributes;
          toAddress = data.find((k) => k.key === 'owner')?.value || null;
          tokenId = tokenId || data.find((k) => k.key === 'token_id')?.value || null;
        } catch (e) {}
      }
      fromAddress = itemMessage.sender;

      if (method === ModeExecuteTransaction.Burn) {
        toAddress = NULL_ADDRESS;
        modeExecute = ModeExecuteTransaction.Burn;
      } else if (method === ModeExecuteTransaction.Mint) {
        fromAddress = NULL_ADDRESS;
        modeExecute = ModeExecuteTransaction.Mint;
      } else if (method === ModeExecuteTransaction.Take) {
        fromAddress = NULL_ADDRESS;
        toAddress = itemMessage.sender;
        modeExecute = ModeExecuteTransaction.Take;
        try {
          const data = JSON.parse(rawLog);
          tokenId =
            data[0]?.events[data[0]?.events?.length - 1]?.attributes.find((k) => k.key === 'token_id')?.value || null;
        } catch (e) {}
      } else if (method === ModeExecuteTransaction.UnEquip) {
        toAddress = NULL_ADDRESS;
        modeExecute = ModeExecuteTransaction.UnEquip;
      } else if (method === ModeExecuteTransaction.AcceptOffer) {
        toAddress = itemMessage?.msg?.accept_nft_offer?.offerer;
      } else if (method === ModeExecuteTransaction.Buy) {
        fromAddress = null;
        toAddress = itemMessage.sender;
        try {
          const data = JSON.parse(rawLog);
          fromAddress =
            data[0]?.events[0]?.attributes.find(
              (k) => k.key === 'receiver' && k.value.length <= LENGTH_CHARACTER.ADDRESS,
            )?.value || null;
        } catch (e) {}
      } else if (method === ModeExecuteTransaction.Send) {
        toAddress = itemMessage?.msg?.send?.contract;
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
  toAddress = toAddress || itemMessage?.contract;
  return [fromAddress, toAddress, value, method, tokenId, modeExecute];
}

export function convertDataTransaction(data, coinInfo) {
  const txs = _.get(data, 'transaction').map((element) => {
    if (!element['data']['body']) {
      element['data']['body'] = element['data']['tx']['body'];
      element['data']['auth_info'] = element['data']['tx']['auth_info'];
    }

    const code = _.get(element, 'code');
    const tx_hash = _.get(element, 'hash');
    const messages = _.get(element, 'data.body.messages');

    let _type = _.get(element, 'data.body.messages[0].@type');
    let lstType = _.get(element, 'data.body.messages');
    let denom = coinInfo.coinDenom;

    // check send token ibc same chain
    if (_type === TRANSACTION_TYPE_ENUM.Send && messages[0]?.amount[0]?.denom !== denom) {
      denom = messages[0].amount[0].denom;
    }

    // check transfer token ibc different chain
    if (_type === TRANSACTION_TYPE_ENUM.IBCTransfer && messages[0]?.token?.denom !== denom) {
      denom = messages[0].token?.denom;
    }

    if (lstType?.length > 1) {
      lstType.forEach((type) => {
        if (type['@type'] !== TRANSACTION_TYPE_ENUM.IBCUpdateClient && type['@type'].indexOf('ibc') > -1) {
          _type = type['@type'];
          try {
            let dataEncode = atob(type?.packet?.data);
            const data = JSON.parse(dataEncode);
            denom = data.denom;
          } catch (e) {
            denom = coinInfo.coinDenom;
          }
          return;
        }
      });
    }

    const _amount = getAmount(
      _.get(element, 'data.body.messages'),
      _type,
      _.get(element, 'data.body.raw_log'),
      coinInfo.coinMinimalDenom,
    );

    const typeOrigin = _type;
    let amount = _.isNumber(_amount) && _amount > 0 ? _amount.toFixed(coinInfo.coinDecimals) : _amount;
    let type = _.find(TYPE_TRANSACTION, { label: _type })?.value || _type.split('.').pop();

    try {
      if (lstType[0]['@type'].indexOf('ibc') == -1) {
        if (lstType[0]['@type'] === TRANSACTION_TYPE_ENUM.GetReward) {
          type = TypeTransaction.GetReward;
        } else if (lstType?.length > 1) {
          if (lstType[0]['@type'] === TRANSACTION_TYPE_ENUM.MultiSend) {
            type = TypeTransaction.MultiSend;
          } else {
            type = 'Multiple';
          }
          amount = 'More';
        }
      }
    } catch (e) {}

    if (typeOrigin === TRANSACTION_TYPE_ENUM.ExecuteContract) {
      try {
        let dataTemp = JSON.parse(messages[0]?.msg);
        let action = Object.keys(dataTemp)[0];
        type = 'Execute_' + action[0]?.toUpperCase() + action.substr(1)?.toLowerCase();
      } catch {}
    }

    const status =
      _.get(element, 'code') == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;

    const fee = balanceOf(_.get(element, 'data.auth_info.fee.amount[0].amount') || 0, coinInfo.coinDecimals).toFixed(
      coinInfo.coinDecimals,
    );
    const height = _.get(element, 'height');
    const timestamp = _.get(element, 'timestamp');
    const gas_used = _.get(element, 'gas_used');
    const gas_wanted = _.get(element, 'gas_wanted');
    let tx = _.get(element, 'data.tx_response');
    if (tx) {
      tx['tx'] = _.get(element, 'data.tx');
    }

    return {
      code,
      tx_hash,
      type,
      status,
      amount,
      fee,
      height,
      timestamp,
      gas_used,
      gas_wanted,
      denom,
      messages,
      tx,
      typeOrigin,
    };
  });
  return txs;
}

export function convertDataBlock(data) {
  const block = _.get(data, 'block').map((element) => {
    const height = _.get(element, 'height');
    const block_hash = _.get(element, 'hash');
    const num_txs = _.get(element, 'data.block.data.txs.length');
    const proposer = _.get(element, 'validator.description.moniker');
    const operator_address = _.get(element, 'validator.operator_address');
    const timestamp = _.get(element, 'time');
    return { height, block_hash, num_txs, proposer, operator_address, timestamp };
  });
  return block;
}

export function convertDataAccountTransaction(data, coinInfo, modeQuery, setReceive = false) {
  const txs = _.get(data, 'transaction').map((element) => {
    const code = _.get(element, 'code');
    const tx_hash = _.get(element, 'hash');

    const lstTypeTemp = _.get(element, 'transaction_messages');
    let type;
    if (lstTypeTemp) {
      if (lstTypeTemp[0]['type'] === TRANSACTION_TYPE_ENUM.GetReward) {
        type = TypeTransaction.GetReward;
      } else if (lstTypeTemp?.length > 1) {
        if (lstTypeTemp[0]['type'] === TRANSACTION_TYPE_ENUM.MultiSend) {
          type = TypeTransaction.MultiSend;
        } else {
          type = 'Multiple';
        }
      }
    }

    let denom = coinInfo.coinDenom;
    const _amount = _.get(element, 'events[0].event_attributes[2].value');
    let amount = balanceOf(_amount?.match(/\d+/g)[0]);

    const status =
      _.get(element, 'code') == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;

    const fee = balanceOf(_.get(element, 'fee[0].amount') || 0, coinInfo.coinDecimals).toFixed(coinInfo.coinDecimals);
    const height = _.get(element, 'height');
    const timestamp = _.get(element, 'timestamp');
    let limit = 5;
    let fromAddress;
    let toAddress;
    let arrEvent;
    let tokenId;
    let contractAddress;

    switch (modeQuery) {
      case TabsAccount.ExecutedTxs:
        type = getTypeTx(element);
        break;
      case TabsAccount.AuraTxs:
        arrEvent = _.get(element, 'transaction_messages')?.map((item, index) => {
          let type = _.get(item, 'type');
          let fromAddress = _.get(item, 'event_attributes[1].value');
          let toAddress = _.get(item, 'event_attributes[0].value');
          let amountTemp = _.get(item, 'event_attributes[2].value')?.match(/\d+/g)[0];
          let denom = coinInfo.coinDenom;
          let amount = balanceOf(Number(amountTemp) || 0, denom);
          return { type, fromAddress, toAddress, amount, denom };
        });
        break;
      case TabsAccount.FtsTxs:
        arrEvent = _.get(element, 'events')?.map((item, index) => {
          let type = getTypeTx(element);
          let fromAddress = _.get(item, 'smart_contract_events[0].cw20_activities[0].from') || NULL_ADDRESS;
          let toAddress = _.get(item, 'smart_contract_events[0].cw20_activities[0].to') || NULL_ADDRESS;
          let denom = _.get(item, 'smart_contract_events[0].smart_contract.cw20_contract.symbol');
          let amountTemp = _.get(item, 'smart_contract_events[0].cw20_activities[0].amount');
          let decimal = _.get(item, 'smart_contract_events[0].smart_contract.cw20_contract.decimal');
          let amount = balanceOf(amountTemp || 0, +decimal);
          return { type, fromAddress, toAddress, amount, denom };
        });
        break;
      case TabsAccount.NftTxs:
        arrEvent = _.get(element, 'events')?.map((item, index) => {
          let type = getTypeTx(element);
          let fromAddress = _.get(item, 'smart_contract_events[0].cw721_activity.from') || NULL_ADDRESS;
          let toAddress = _.get(item, 'smart_contract_events[0].cw721_activity.to') || NULL_ADDRESS;
          let contractAddress = _.get(element, 'transaction_messages[0].content.contract');
          let dataTemp = _.get(element, 'transaction_messages[0].content.msg');
          let tokenId;
          if (typeof dataTemp === 'string') {
            try {
              dataTemp = JSON.parse(dataTemp);
              tokenId = dataTemp[Object.keys(dataTemp)[0]]?.token_id || '';
            } catch (e) {}
          }

          return { type, fromAddress, toAddress, tokenId, contractAddress };
        });
        break;
    }

    if (modeQuery !== TabsAccount.ExecutedTxs) {
      fromAddress = arrEvent[0]?.fromAddress;
      toAddress = arrEvent[0]?.toAddress;
      denom = arrEvent[0]?.denom;
      amount = arrEvent[0]?.amount;
      type = arrEvent[0]?.type || lstTypeTemp[0]?.type?.split('.').pop();
      tokenId = arrEvent[0]?.tokenId;
      contractAddress = arrEvent[0]?.contractAddress;
    }

    if (type === 'Send' && setReceive) {
      type = 'Receive';
    }

    return {
      code,
      tx_hash,
      type,
      status,
      amount,
      fee,
      height,
      timestamp,
      denom,
      fromAddress,
      toAddress,
      tokenId,
      contractAddress,
      arrEvent,
      limit,
    };
  });
  return txs;
}

export function getTypeTx(element) {
  let type = _.get(element, 'transaction_messages[0].content["@type"]');
  if (type === TRANSACTION_TYPE_ENUM.ExecuteContract) {
    try {
      let dataTemp = _.get(element, 'transaction_messages[0].content.msg');
      dataTemp = JSON.parse(dataTemp);
      let action = Object.keys(dataTemp)[0];
      type = 'Execute_' + action[0]?.toUpperCase() + action.substr(1)?.toLowerCase();
    } catch (e) {}
  } else {
    type = _.find(TYPE_TRANSACTION, { label: type })?.value || type.split('.').pop();
  }
  return type;
}
