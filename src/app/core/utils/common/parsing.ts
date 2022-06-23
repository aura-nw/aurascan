import BigNumber from 'bignumber.js';

export function balanceOf(amount: string | number): number {
  return +(new BigNumber(amount).toNumber() / Math.pow(10, 6)).toFixed(6);
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
