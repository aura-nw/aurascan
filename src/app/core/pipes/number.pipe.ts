import { formatNumber } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';
import { NgxMaskPipe } from 'ngx-mask';
import { CommonService } from '../services/common.service';
import { balanceOf, parseFullNumber } from '../utils/common/parsing';

@Pipe({ name: 'convertSmallNumber' })
export class ConvertSmallNumberPipe implements PipeTransform {
  transform(amount: number, decimal: number = 6): any {
    let value = new BigNumber(amount).dividedBy(Math.pow(10, decimal));
    return parseFullNumber(value.toFixed()) !== '0.001' ? parseFullNumber(value.toFixed()) : '';
  }
}

@Pipe({ name: 'formatStringNumber' })
export class FormatStringNumberPipe implements PipeTransform {
  transform(valueString: string): any {
    let decimalStr;
    if (valueString.toString().includes('.')) {
      decimalStr = valueString.toString().split('.')[1];
      valueString = valueString.toString().split('.')[0];
    }
    return valueString.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (decimalStr ? '.' + decimalStr : '');
  }
}

@Pipe({ name: 'formatDigit' })
export class FormatDigitPipe implements PipeTransform {
  transform(amount: number, digit = 0) {
    let digitConvert = '1.' + digit + '-' + digit;
    return formatNumber(amount, 'en-GB', digitConvert);
  }
}

@Pipe({ name: 'convertLogAmount' })
export class ConvertLogAmountPipe implements PipeTransform {
  constructor(private commonService: CommonService, private mask: NgxMaskPipe) {}

  transform(value: string, getDenomOnly = false): string {
    if (!value) return '';
    let amount = value?.match(/\d+/g)[0];
    let data = this.commonService.mappingNameIBC(value);
    if (getDenomOnly) {
      return data['display'];
    }
    amount = this.mask.transform(balanceOf(amount, data['decimals']), 'separator.6');
    if (+amount <= 0) {
      return '-';
    }
    return amount + `<span class="text--primary ml-1">` + data['display'] + `</span>`;
  }
}

@Pipe({ name: 'balanceOf' })
export class BalanceOfPipe implements PipeTransform {
  transform(amount: string | number, decimal = 6) {
    let value = +(new BigNumber(amount).toNumber() / Math.pow(10, decimal)).toFixed(decimal);
    return parseFullNumber(value) !== '0.001' ? parseFullNumber(value) : '';
  }
}
