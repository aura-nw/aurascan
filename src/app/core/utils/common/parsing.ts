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
  return Intl.NumberFormat('en', { maximumFractionDigits: decimal }).format(Number(num));
}

export function parseFullNumber(x) {
  if (Math.abs(x) < 1.0) {
    const e = parseInt(x.toString().split('e-')[1]);
    if (e) {
      x *= Math.pow(10, e - 1);
      x = '0.' + new Array(e).join('0') + x.toString().substring(2);
    }
  } else {
    let e = parseInt(x.toString().split('+')[1]);
    if (e > 20) {
      e -= 20;
      x /= Math.pow(10, e);
      x += new Array(e + 1).join('0');
    }
  }
  return x;
}
