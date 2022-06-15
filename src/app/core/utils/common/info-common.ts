import { NUMBER_CONVERT } from '../../constants/common.constant';

export function getInfo(globals: any, data: any): void {
  globals.dataHeader = data;
  globals.dataHeader.bonded_tokens = globals.dataHeader.bonded_tokens / NUMBER_CONVERT;
  globals.dataHeader.bonded_tokens_format = formatNumber(globals.dataHeader.bonded_tokens);
  globals.dataHeader.community_pool_format = formatNumber(globals.dataHeader.community_pool);
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
  return (isNegative ? '-' : '') + abs + key;
}
