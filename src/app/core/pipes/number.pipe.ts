import { formatNumber } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';
import { NgxMaskService } from 'ngx-mask';
import { CommonService } from '../services/common.service';
import { getBalance } from '../utils/common/parsing';

@Pipe({ name: 'formatDigit' })
export class FormatDigitPipe implements PipeTransform {
  transform(amount: number, digit = 0) {
    let digitConvert = '1.' + digit + '-' + digit;
    return formatNumber(amount, 'en-GB', digitConvert);
  }
}

@Pipe({ name: 'convertLogAmount' })
export class ConvertLogAmountPipe implements PipeTransform {
  constructor(private commonService: CommonService, private mask: NgxMaskService) {}

  transform(value: string, getDenomOnly = false): string {
    if (!value) return '';
    let amount = value?.match(/\d+/g)[0];
    let data = this.commonService.mappingNameIBC(value);
    if (getDenomOnly) {
      return data['display'];
    }

    amount = this.mask.applyMask(getBalance(amount, data['decimals']), 'separator.6');

    if (+amount <= 0) {
      return '-';
    }

    return amount + `<span class="text--primary ml-1">` + data['display'] + `</span>`;
  }
}

@Pipe({ name: 'balance' })
export class BalancePipe implements PipeTransform {
  transform(amount: number, decimal: number = 0, notFixed = false): any {
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
