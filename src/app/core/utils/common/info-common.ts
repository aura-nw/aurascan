import * as _ from 'lodash';
import { getAmount, getDataInfo } from 'src/app/global/global';
import { MEDIA_TYPE, NUMBER_CONVERT } from '../../constants/common.constant';
import { TYPE_TRANSACTION } from '../../constants/transaction.constant';
import { CodeTransaction, StatusTransaction } from '../../constants/transaction.enum';
import { balanceOf } from './parsing';

export function getInfo(globals: any, data: any): void {
  globals.dataHeader = data;
  globals.dataHeader.bonded_tokens = formatNumber(globals.dataHeader.bonded_tokens / NUMBER_CONVERT) || 0;
  globals.dataHeader.total_aura = formatNumber(+globals?.dataHeader?.total_aura / NUMBER_CONVERT);
  globals.dataHeader.bonded_tokens_format = formatNumber(globals?.dataHeader?.bonded_tokens);
  globals.dataHeader.community_pool = Math.round(globals?.dataHeader?.community_pool / NUMBER_CONVERT);
  globals.dataHeader.community_pool_format = formatNumber(globals?.dataHeader?.community_pool);
  globals.dataHeader.inflation = globals?.dataHeader?.inflation * 100 + '%';
}

export function formatNumber(number: number, args?: any): any {
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

export function parseDataTransaction(trans: any, coinMinimalDenom: string, tokenID = '') {
  let typeOrigin = trans.data?.tx?.body?.messages[0]['@type'];
  const typeTrans = TYPE_TRANSACTION.find((f) => f.label.toLowerCase() === typeOrigin?.toLowerCase());
  trans.tx_hash = trans.hash;
  //get amount of transaction
  trans.amount = getAmount(trans.data?.tx?.body?.messages, typeOrigin, trans.tx_response?.raw_log, coinMinimalDenom);
  trans.fee = balanceOf(trans?.data?.auth_info?.fee?.amount[0]?.amount);
  trans.gas_limit = balanceOf(trans?.data?.auth_info?.fee?.gas_limit);
  trans.height = trans?.height;
  trans.timestamp = trans?.timestamp;
  trans.status = StatusTransaction.Fail;
  if (Number(trans?.code) === CodeTransaction.Success) {
    trans.status = StatusTransaction.Success;
  }
  [trans.from_address, trans.to_address, trans.amountToken, trans.method, trans.token_id, trans.modeExecute] =
    getDataInfo(trans.data?.tx?.body?.messages, tokenID, trans.data?.tx_response?.raw_log);
  trans.type = trans.method || typeTrans?.value;
  trans.depositors = trans.data?.tx?.body?.messages[0]?.depositor;
  trans.price = balanceOf(_.get(trans, 'data.body.messages[0].funds[0].amount'));
  return trans;
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

export function convertTx(value: string, coinConfig: any, decimal = 6) {
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
    result = coinConfig?.find((k) => k.denom === display) || { display: value, decimal: decimal };
  } else {
    result = { display: display, decimal: decimal };
  }
  result['denom'] = result['denom'] || display;
  return result;
}
