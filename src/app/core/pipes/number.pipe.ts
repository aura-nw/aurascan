import { formatNumber } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';

@Pipe({ name: 'formatDigit' })
export class FormatDigitPipe implements PipeTransform {
  transform(amount: number, digit = 0) {
    let digitConvert = '1.' + digit + '-' + digit;
    return formatNumber(amount, 'en-GB', digitConvert);
  }
}

@Pipe({ name: 'balance' })
export class BalancePipe implements PipeTransform {
  transform(amount: number | string, decimal: number = 0, notFixed = false): any {
    const value = BigNumber(amount).dividedBy(BigNumber(10).pow(decimal));

    return notFixed ? value : value.toFixed();
  }
}

@Pipe({ name: 'gte' })
export class GtePipe implements PipeTransform {
  constructor() {}
  transform(amount: number | string, val: number | string): any {
    return BigNumber(amount).gte(BigNumber(val));
  }
}

@Pipe({ name: 'gt' })
export class GtPipe implements PipeTransform {
  constructor() {}
  transform(amount: number | string, val: number | string): any {
    return BigNumber(amount).gt(BigNumber(val));
  }
}

@Pipe({ name: 'lte' })
export class LtePipe implements PipeTransform {
  constructor() {}
  transform(amount: number | string, val: number | string): any {
    return BigNumber(amount).lte(BigNumber(val));
  }
}

@Pipe({ name: 'lt' })
export class LtPipe implements PipeTransform {
  constructor() {}
  transform(amount: number | string, val: number | string): any {
    return BigNumber(amount).lt(BigNumber(val));
  }
}

@Pipe({ name: 'eq' })
export class EqPipe implements PipeTransform {
  constructor() {}
  transform(amount: number | string, val: number | string): any {
    return BigNumber(amount).eq(BigNumber(val));
  }
}
