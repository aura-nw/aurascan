import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { TabsAccountLink } from '../core/constants/account.enum';
import { LENGTH_CHARACTER, NULL_ADDRESS, STORAGE_KEYS } from '../core/constants/common.constant';
import { TYPE_TRANSACTION } from '../core/constants/transaction.constant';
import {
  CodeTransaction,
  ModeExecuteTransaction,
  StatusTransaction,
  TRANSACTION_TYPE_ENUM,
  TypeTransaction,
} from '../core/constants/transaction.enum';
import { CommonDataDto } from '../core/models/common.model';
import { convertTxNative, getTypeTx } from '../core/utils/common/info-common';
import { balanceOf } from '../core/utils/common/parsing';
import local from '../core/utils/storage/local';
import BigNumber from 'bignumber.js';

Injectable();

export class Globals {
  dataHeader = new CommonDataDto();
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

export function convertDataTransaction(data, coinDecimals) {
  const txs = _.get(data, 'transaction').map((element) => {
    if (element['data']) {
      if (!element['data']['body'] && !element['data']['linkS3']) {
        element['data']['body'] = element['data']['tx']['body'];
      }
    }

    const code = _.get(element, 'code');
    const tx_hash = _.get(element, 'hash');
    const messages = _.get(element, 'data.body.messages') || _.get(element, 'transaction_messages');

    let _type =
      _.get(element, 'data.body.messages[0].@type') || _.get(element, 'transaction_messages[0].content["@type"]');
    let lstType = _.get(element, 'data.body.messages') || _.get(element, 'transaction_messages');

    if (lstType?.length > 1) {
      lstType.forEach((type) => {
        const typeTemp = _.get(type, 'content[@type]') || _.get(type, '@type');
        if (typeTemp !== TRANSACTION_TYPE_ENUM.IBCUpdateClient && typeTemp?.indexOf('ibc') > -1) {
          _type = typeTemp;
          return;
        }
      });
    }

    // Get fee by evm denom and cosmos minimalDenom
    const { amount, denom } = _.get(element, 'fee[0]') || _.get(element, 'data.auth_info.fee.amount[0]');
    const fee = BigNumber(balanceOf(amount || 0, coinDecimals[denom?.toLowerCase()])).toFixed();

    const typeOrigin = _type;
    let type = _.find(TYPE_TRANSACTION, { label: _type })?.value || _type.split('.').pop();
    if (type.startsWith('Msg')) {
      type = type?.replace('Msg', '');
    }

    try {
      const typeTemp = _.get(lstType, '[0].content[@type]') || _.get(lstType, '[0].@type');
      if (typeTemp?.indexOf('ibc') == -1) {
        if (typeTemp === TRANSACTION_TYPE_ENUM.GetReward) {
          type = TypeTransaction.GetReward;
        } else if (lstType?.length > 1) {
          if (typeTemp === TRANSACTION_TYPE_ENUM.MultiSend) {
            type = TypeTransaction.MultiSend;
          } else {
            type = 'Multiple';
          }
        }
      }
    } catch (e) {}

    if (typeOrigin === TRANSACTION_TYPE_ENUM.ExecuteContract) {
      try {
        let msg = _.get(messages, '[0].msg') || _.get(messages, '[0].content.msg');
        let dataTemp = JSON.parse(msg);
        let action = Object.keys(dataTemp)[0];
        type = 'Contract: ' + action;
      } catch {}
    }

    const status =
      _.get(element, 'code') == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;
    const height = _.get(element, 'height');
    const timestamp = _.get(element, 'timestamp');
    const memo = _.get(element, 'memo');
    let tx = _.get(element, 'data.tx_response');
    if (tx) {
      tx['tx'] = _.get(element, 'data.tx');
    }

    return {
      code,
      tx_hash,
      type,
      status,
      fee,
      height,
      timestamp,
      messages,
      tx,
      typeOrigin,
      lstType,
      memo,
    };
  });
  return txs;
}

export function convertDataBlock(data) {
  const block = _.get(data, 'block').map((element) => {
    const height = _.get(element, 'height');
    const block_hash = _.get(element, 'hash');
    const num_txs = _.get(element, 'tx_count') || 0;
    const proposer = _.get(element, 'validator.description.moniker');
    const operator_address = _.get(element, 'validator.operator_address');
    const timestamp = _.get(element, 'time');
    return { height, block_hash, num_txs, proposer, operator_address, timestamp };
  });
  return block;
}

export function convertDataAccountTransaction(data, coinInfo, modeQuery, coinDecimals?: any, setReceive = false) {
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
    let amount;
    if (_amount) {
      amount = balanceOf(_amount?.match(/\d+/g)[0]);
    }

    const status =
      _.get(element, 'code') == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;

    // Get fee by evm denom and cosmos minimalDenom
    const { amount: feeAmount, denom: feeDenom } = _.get(element, 'fee[0]') ||
      _.get(element, 'data.auth_info.fee.amount[0]') || {
        amount: 0,
        denom: '',
      };

    const fee = BigNumber(balanceOf(feeAmount || 0, coinDecimals[feeDenom?.toLowerCase()])).toFixed();

    const height = _.get(element, 'height');
    const timestamp = _.get(element, 'timestamp');
    let limit = 5;
    let fromAddress;
    let toAddress;
    let arrEvent;
    let tokenId;
    let contractAddress;
    let action;
    let eventAttr;
    let evmTx;

    switch (modeQuery) {
      case TabsAccountLink.ExecutedTxs:
        type = getTypeTx(element)?.type;
        evmTx = _.get(element, 'evm_transaction.hash');
        break;
      case TabsAccountLink.NativeTxs:
        let arrTemp = [];
        element?.coin_transfers?.forEach((data, i) => {
          toAddress = data.to;
          fromAddress = data.from;
          let { type, action } = getTypeTx(element);
          let amountString = data.amount + data.denom || denom;
          let decimal = coinInfo.coinDecimals;
          let amountTemp = data.amount;
          let denomOrigin;
          if (amountString?.indexOf('ibc') > -1) {
            const dataIBC = convertTxNative(amountString, coinInfo.coinDecimals);
            decimal = dataIBC['decimal'];
            amount = balanceOf(Number(data.amount) || 0, dataIBC['decimal'] || decimal);
            denomOrigin = dataIBC['denom'];
            denom = dataIBC['display']?.indexOf('ibc') === -1 ? 'ibc/' + dataIBC['display'] : dataIBC['display'];
          } else {
            amount = balanceOf(Number(data.amount) || 0, decimal);
            denom = coinInfo.coinDenom;
          }
          const result = { type, toAddress, fromAddress, amount, denom, amountTemp, action, decimal, denomOrigin };
          arrTemp.push(result);
        });
        arrEvent = arrTemp;
        break;
      case TabsAccountLink.FtsTxs:
        arrEvent = _.get(element, 'cw20_activities')?.map((item, index) => {
          let { type, action } = getTypeTx(element);
          let fromAddress = _.get(item, 'from') || NULL_ADDRESS;
          let toAddress = _.get(item, 'to') || NULL_ADDRESS;
          let denom = _.get(item, 'cw20_contract.symbol');
          let amountTemp = _.get(item, 'amount');
          let decimal = _.get(item, 'cw20_contract.decimal');
          let amount = balanceOf(amountTemp || 0, +decimal);
          let contractAddress = _.get(item, 'cw20_contract.smart_contract.address');
          return { type, fromAddress, toAddress, amount, denom, contractAddress, action, amountTemp, decimal };
        });
        break;
      case TabsAccountLink.NftTxs:
        arrEvent = _.get(element, 'cw721_activities')?.map((item, index) => {
          let { type, action } = getTypeTx(element);
          let fromAddress = _.get(item, 'from') || NULL_ADDRESS;
          let toAddress = _.get(item, 'to') || _.get(item, 'cw721_contract.smart_contract.address') || NULL_ADDRESS;
          if (action === 'burn') {
            toAddress = NULL_ADDRESS;
          }

          let contractAddress = _.get(item, 'cw721_contract.smart_contract.address');
          let tokenId = _.get(item, 'cw721_token.token_id');
          let eventAttr = element.event_attribute_index;
          return { type, fromAddress, toAddress, tokenId, contractAddress, eventAttr };
        });
        break;
    }

    if (modeQuery !== TabsAccountLink.ExecutedTxs) {
      fromAddress = arrEvent[0]?.fromAddress;
      toAddress = arrEvent[0]?.toAddress;
      denom = arrEvent[0]?.denom;
      amount = arrEvent[0]?.amount;
      type = arrEvent[0]?.type || lstTypeTemp[0]?.type?.split('.').pop();
      if (type?.startsWith('Msg')) {
        type = type?.replace('Msg', '');
      }
      tokenId = arrEvent[0]?.tokenId;
      contractAddress = arrEvent[0]?.contractAddress;
      action = arrEvent[0]?.action;
      eventAttr = arrEvent[0]?.eventAttr;
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
      height,
      timestamp,
      denom,
      fromAddress,
      toAddress,
      tokenId,
      contractAddress,
      fee,
      arrEvent,
      limit,
      action,
      eventAttr,
      lstTypeTemp,
      evmTx,
    };
  });
  return txs;
}

export function convertDataTransactionSimple(data, coinDecimals) {
  return _.get(data, 'transaction').map((element) => {
    const code = _.get(element, 'code');
    const tx_hash = _.get(element, 'hash');
    const txMessages = _.get(element, 'transaction_messages');
    const txBodyMsgType = _.get(element, 'data[0][@type]');
    const hash = _.get(element, 'evm_transaction.hash');

    let type = '';
    if (txMessages?.length > 0) {
      const msgType = _.get(txMessages, '[0].type');

      type = _.find(TYPE_TRANSACTION, { label: msgType })?.value || msgType?.split('.').pop();
      if (msgType === TRANSACTION_TYPE_ENUM.ExecuteContract) {
        try {
          let dataTemp = JSON.parse(txMessages[0]?.content?.msg);
          let action = Object.keys(dataTemp)[0];
          type = 'Contract: ' + action;
        } catch {}
      }
    } else {
      type = txBodyMsgType?.split('.').pop();
    }

    if (type?.startsWith('Msg')) {
      type = type?.replace('Msg', '');
    }

    const status =
      _.get(element, 'code') == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;

    // Get fee by evm denom and cosmos minimalDenom
    const { amount, denom } = _.get(element, 'fee[0]') || _.get(element, 'data.auth_info.fee.amount[0]');
    const fee = BigNumber(balanceOf(amount || 0, coinDecimals[denom?.toLowerCase()])).toFixed();

    const height = _.get(element, 'height');
    const timestamp = _.get(element, 'timestamp');
    let tx = _.get(element, 'data.tx_response');
    if (tx) {
      tx['tx'] = _.get(element, 'data.tx');
    }

    return {
      code,
      tx_hash,
      type,
      status,
      fee,
      height,
      timestamp,
      tx,
      hash,
      lstType: txMessages,
    };
  });
}

export function clearLocalData() {
  local.removeItem(STORAGE_KEYS.USER_DATA);
  local.removeItem(STORAGE_KEYS.LIST_NAME_TAG);
  local.removeItem(STORAGE_KEYS.LIST_WATCH_LIST);
  local.removeItem(STORAGE_KEYS.REGISTER_FCM);
}

export function convertTxIBC(data, coinInfo) {
  const txs = _.get(data, 'ibc_ics20').map((data) => {
    let element = data.ibc_message?.transaction;
    const code = _.get(element, 'code');
    const lstTypeTemp = _.get(element, 'transaction_messages');
    const status = code == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;
    let amountTemp = _.get(data, 'amount');
    let amount = balanceOf(amountTemp || 0, coinInfo.coinDecimals);

    return {
      code,
      tx_hash: _.get(element, 'hash'),
      type: getTypeTx(element)?.type,
      status,
      from_address: _.get(data, 'sender'),
      to_address: _.get(data, 'receiver'),
      fee: BigNumber(balanceOf(_.get(element, 'fee[0].amount') || 0, coinInfo.coinDecimals)).toFixed(),
      height: _.get(element, 'height'),
      timestamp: _.get(element, 'timestamp'),
      amount,
      amountTemp,
      denom: _.get(data, 'denom'),
      lstTypeTemp,
    };
  });
  return txs;
}
