import * as _ from 'lodash';
import { getAmount, getDataInfo } from 'src/app/global/global';
import { NUMBER_CONVERT } from '../../constants/common.constant';
import { TYPE_TRANSACTION } from '../../constants/transaction.constant';
import { CodeTransaction, StatusTransaction } from '../../constants/transaction.enum';
import { balanceOf } from './parsing';

export function getInfo(globals: any, data: any): void {
  globals.dataHeader = data;
  globals.dataHeader.bonded_tokens = formatNumber(globals.dataHeader.bonded_tokens / NUMBER_CONVERT) || 0;
  globals.dataHeader.supply = formatNumber(globals?.dataHeader?.supply / NUMBER_CONVERT);
  globals.dataHeader.bonded_tokens_format = formatNumber(globals?.dataHeader?.bonded_tokens);
  globals.dataHeader.community_pool = Math.round(globals?.dataHeader?.community_pool / NUMBER_CONVERT);
  globals.dataHeader.community_pool_format = formatNumber(globals?.dataHeader?.community_pool);
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
  let typeOrigin = trans.tx_response?.tx?.body?.messages[0]['@type'];
  const typeTrans = TYPE_TRANSACTION.find((f) => f.label.toLowerCase() === typeOrigin?.toLowerCase());
  trans.tx_hash = trans.tx_response?.txhash;
  //get amount of transaction
  trans.amount = getAmount(
    trans.tx_response?.tx?.body?.messages,
    typeOrigin,
    trans.tx_response?.raw_log,
    coinMinimalDenom,
  );
  trans.fee = balanceOf(trans?.tx_response?.tx?.auth_info?.fee?.amount[0]?.amount);
  trans.gas_limit = balanceOf(trans?.tx_response?.tx?.auth_info?.fee?.gas_limit);
  trans.height = trans.tx_response?.height;
  trans.timestamp = trans.tx_response?.timestamp;
  trans.status = StatusTransaction.Fail;
  if (Number(trans.tx_response?.code) === CodeTransaction.Success) {
    trans.status = StatusTransaction.Success;
  }
  [trans.from_address, trans.to_address, trans.amountToken, trans.method, trans.token_id, trans.modeExecute] =
    getDataInfo(trans.tx_response?.tx?.body?.messages, tokenID, trans.tx_response?.raw_log);
  trans.type = trans.method || typeTrans?.value;
  trans.depositors = trans.tx_response?.tx?.body?.messages[0]?.depositor;
  trans.price = balanceOf(_.get(trans, 'tx_response.tx.body.messages[0].funds[0].amount'));
  return trans;
}

export function checkTypeFile(nft: any) {
  let nftType = nft.img_type || '';
  let content_type = '';
  if (!nftType) {
    if (nft?.animation) {
      nftType = nft?.animation?.content_type || '';
    }
    if (nft?.image && nftType == '') {
      nftType = nft?.image?.content_type || '';
    }
  }

  switch (nftType) {
    case 'video/webm':
    case 'video/mp4':
      content_type = 'video';
      break;
    case 'image/png':
    case 'image/jpeg':
    case 'image/gif':
    case 'application/xml':
    case 'image/svg+xml':
    case 'image/webp':
      content_type = 'img';
      break;
    case 'model/gltf-binary':
      content_type = '3d';
      break;
    case 'audio/mpeg':
    case 'audio/vnd.wave':
    case 'audio/ogg':
      content_type = 'audio';
      break;
    default:
      content_type = '';
  }
  return content_type;
}
