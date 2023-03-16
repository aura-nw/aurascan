import BigNumber from 'bignumber.js';

export function balanceOf(amount: string | number, decimal = 6): number {
  return +(new BigNumber(amount).toNumber() / Math.pow(10, 6)).toFixed(decimal);
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
