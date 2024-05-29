import * as _ from 'lodash';
import { MEDIA_TYPE, STORAGE_KEYS } from '../../constants/common.constant';
import { TYPE_TRANSACTION } from '../../constants/transaction.constant';
import { TRANSACTION_TYPE_ENUM } from '../../constants/transaction.enum';
import { ESigningType, WALLET_PROVIDER } from '../../constants/wallet.constant';
import local from '../storage/local';
import BigNumber from 'bignumber.js';
import { getBalance } from './parsing';

export function getInfo(globals: any, data: any, coinDecimals: number): void {
  globals.dataHeader = data;
  globals.dataHeader.bonded_tokens = BigNumber(getBalance(globals.dataHeader.bonded_tokens, coinDecimals)).toFixed(0);
  globals.dataHeader.total_aura = BigNumber(getBalance(globals.dataHeader.total_aura, coinDecimals)).toFixed(0);
  globals.dataHeader.community_pool = BigNumber(getBalance(globals.dataHeader.community_pool, coinDecimals)).toFixed(0);
  globals.dataHeader.community_pool_format = formatLargeNumber(globals.dataHeader.community_pool);
  globals.dataHeader.inflation = globals?.dataHeader?.inflation * 100 + '%';
}

export function formatLargeNumber(number: number, args?: any): any {
  if (isNaN(number)) return null; // will only work value is a number
  if (number === null) return null;
  if (number === 0) return null;
  let abs = Math.abs(number);
  const rounder = Math.pow(10, 1);
  const isNegative = number < 0; // will also work for Negetive numbers
  let key = '';

  const powers = [
    { key: 'Q', value: Math.pow(10, 15) },
    { key: 'T', value: Math.pow(10, 12) },
    { key: 'B', value: Math.pow(10, 9) },
    { key: 'M', value: Math.pow(10, 6) },
    { key: 'K', value: 1000 },
  ];

  for (let i = 0; i < powers.length; i++) {
    let reduced = abs / powers[i].value;
    reduced = Math.round(reduced * rounder) / rounder;
    if (reduced >= 1) {
      abs = reduced;
      key = powers[i].key;
      break;
    }
  }

  if (key === '') {
    let numberVote: string;
    numberVote = Math.round(+abs).toString();
    return (isNegative ? '-' : '') + numberVote + key;
  }
  return (isNegative ? '-' : '') + abs + key;
}

export function checkTypeFile(nft: any) {
  let nftType = nft.img_type || '';
  let content_type = '';
  if (!nftType) {
    if (
      (typeof nft?.media_info?.offchain?.animation === 'object' &&
        Object.keys(nft?.media_info?.offchain?.animation)?.length > 0) ||
      nft?.animation
    ) {
      nftType = nft?.media_info?.offchain?.animation?.content_type || nft?.animation?.content_type || '';
    }
    if (nftType == '' && (nft?.media_info?.offchain?.image || nft?.image?.link_s3)) {
      nftType = nft?.media_info?.offchain?.image?.content_type || nft?.image?.content_type || '';
    }
  }

  switch (nftType) {
    case 'video/webm':
    case 'video/mp4':
      content_type = MEDIA_TYPE.VIDEO;
      break;
    case 'image/png':
    case 'image/jpeg':
    case 'image/gif':
    case 'application/xml':
    case 'image/svg+xml':
    case 'image/webp':
    case 'image/avif':
      content_type = MEDIA_TYPE.IMG;
      break;
    case 'model/gltf-binary':
      content_type = MEDIA_TYPE._3D;
      break;
    case 'audio/mpeg':
    case 'audio/vnd.wave':
    case 'audio/ogg':
    case 'audio/wav':
      content_type = MEDIA_TYPE.AUDIO;
      break;
    default:
      content_type = '';
  }
  return content_type;
}

export function convertTxNative(value: string, decimal = 6) {
  const listTokenIBC = local.getItem<any>(STORAGE_KEYS.LIST_TOKEN_IBC);
  let result = {};
  if (!value) return result;
  let display;
  if (value.indexOf('ibc') >= 0) {
    try {
      if (!value.startsWith('ibc')) {
        let temp = value?.match(/\d+/g)[0];
        value = value?.replace(temp, '');
      }
    } catch {}
    display = value.slice(value.indexOf('ibc'));
    result = listTokenIBC?.find((k) => k.denom === display) || { display: value, decimal: decimal };
  } else {
    result = { display: display, decimal: decimal };
  }
  result['denom'] = result['denom'] || display;
  return result;
}

export function getSigningType(provider: WALLET_PROVIDER) {
  switch (provider) {
    case WALLET_PROVIDER.COIN98:
      return ESigningType.Coin98;
    case WALLET_PROVIDER.LEAP:
      return ESigningType.Leap;
    default:
      return ESigningType.Keplr;
  }
}

export function getTypeTx(element) {
  let type =
    _.get(element, "transaction_messages[0].content['@type']") ||
    _.get(element, "transaction_message.content['@type']") ||
    _.get(element, "messages[0]['@type']") ||
    _.get(element, "messages[0].content['@type']");
  let action;
  if (type === TRANSACTION_TYPE_ENUM.ExecuteContract) {
    try {
      let dataTemp =
        _.get(element, 'transaction_messages[0].content.msg') ||
        _.get(element, 'messages[0].msg') ||
        _.get(element, 'messages[0].content.msg');
      if (typeof dataTemp === 'string') {
        try {
          dataTemp = JSON.parse(dataTemp);
        } catch (e) {}
      }
      action = Object.keys(dataTemp)[0];
      type = 'Contract: ' + action;
    } catch (e) {}
  } else {
    type = _.find(TYPE_TRANSACTION, { label: type })?.value || type.split('.').pop();
    if (type.startsWith('Msg')) {
      type = type?.replace('Msg', '');
    }
  }
  return { type, action };
}
