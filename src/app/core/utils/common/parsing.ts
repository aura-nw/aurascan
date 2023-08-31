import BigNumber from 'bignumber.js';

export function balanceOf(amount: string | number, decimal = 6): number {
  return +(new BigNumber(amount).toNumber() / Math.pow(10, decimal)).toFixed(decimal);
}

export function parseLabel(label: number) {
  return (
    {
      0: 'OUT',
      1: 'IN',
      2: 'CREATION',
    }[label] || ''
  );
}

export function IntlFormat(num: number | string, decimal: number) {
  return Intl.NumberFormat('en', { maximumFractionDigits: decimal }).format(
    Number(num)
  );
}