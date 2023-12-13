import {formatDate, formatNumber} from '@angular/common';
import {Pipe, PipeTransform} from '@angular/core';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import {NgxMaskPipe} from 'ngx-mask';
import {TYPE_TRANSACTION} from '../constants/transaction.constant';
import {TRANSACTION_TYPE_ENUM} from '../constants/transaction.enum';
import {EnvironmentService} from '../data-services/environment.service';
import {CommonService} from '../services/common.service';
import {balanceOf, parseFullNumber} from '../utils/common/parsing';

@Pipe({name: 'cutStringPipe'})
export class CutStringPipe implements PipeTransform {
  transform(value: string, start: number, end?: number): string {
    let endChar = end || 0;
    if (value && value.length > start + endChar) {
      if (end) {
        const firstChar = value.substring(0, start);
        const lastChar = value.substring(value.length - end);
        value = firstChar + '...' + lastChar;
      } else {
        const middleText = value.substring(0, start);
        value = middleText + '...';
      }
    }
    return value;
  }
}

@Pipe({name: 'stringEllipsis'})
export class StringEllipsisPipe implements PipeTransform {
  transform(value: string, limit: number): string {
    if (value && value.length > limit) {
      let firstChar = limit ? value.substring(0, limit) : value.substring(0, 16);
      value = firstChar + '...';
    }
    return value;
  }
}

@Pipe({name: 'imageS3'})
export class ImageURLPipe implements PipeTransform {
  constructor(private environmentService: EnvironmentService) {
  }

  transform(value: string): string {
    const replacePath = /\..\//gi;
    value = value.replace(replacePath, '');
    const replaceLink = /assets\//gi;
    value = value.replace(replaceLink, this.environmentService.imageUrl);
    return value;
  }
}

@Pipe({name: 'customDate'})
export class CustomDatePipe implements PipeTransform {
  transform(value: string, format: string) {
    const date = new Date(value);
    value = formatDate(date, format, 'en-US');
    return value;
  }
}

@Pipe({name: 'balanceOf'})
export class BalanceOfPipe implements PipeTransform {
  transform(amount: string | number, decimal = 6) {
    let value = +(new BigNumber(amount).toNumber() / Math.pow(10, decimal)).toFixed(decimal);
    return parseFullNumber(value) !== '0.001' ? parseFullNumber(value) : '';
  }
}

@Pipe({name: 'replaceIpfs'})
export class ReplaceIpfsPipe implements PipeTransform {
  constructor(private environmentService: EnvironmentService) {
  }

  transform(value: string): string {
    return this.environmentService.ipfsDomain + value.replace('://', '/');
  }
}

@Pipe({name: 'convertLogAmount'})
export class ConvertLogAmountPipe implements PipeTransform {
  constructor(private commonService: CommonService, private mask: NgxMaskPipe) {
  }

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

@Pipe({name: 'decodeData'})
export class DecodeDataPipe implements PipeTransform {
  transform(value: string): string {
    return atob(value);
  }
}

@Pipe({name: 'displayTypeToolTip'})
export class DisplayTypeToolTipPipe implements PipeTransform {
  transform(value: any): string {
    let result = '';
    value.forEach((element, index) => {
      const typeMsg = element.type || element['@type'];
      let type;
      if (typeMsg === TRANSACTION_TYPE_ENUM.ExecuteContract) {
        try {
          let dataTemp = _.get(element, 'content.msg') || _.get(element, 'msg');
          if (typeof dataTemp === 'string') {
            try {
              dataTemp = JSON.parse(dataTemp);
            } catch (e) {
            }
          }
          let action = Object.keys(dataTemp)[0];
          type = 'Contract: ' + action;
        } catch (e) {
        }
      } else {
        type = _.find(TYPE_TRANSACTION, {label: typeMsg})?.value || typeMsg.split('.').pop().replace('Msg', '');
      }

      if (index <= 4) {
        if (result?.length > 0) {
          result += ', ' + type;
        } else {
          result += type;
        }
      }
    });
    if (value?.length > 5) {
      result += ', ...';
    }
    return result;
  }
}

@Pipe({name: 'convertSmallNumber'})
export class ConvertSmallNumberPipe implements PipeTransform {
  transform(amount: number, decimal: number = 6): any {
    let value = +(new BigNumber(amount).toNumber() / Math.pow(10, decimal)).toFixed(decimal);
    return parseFullNumber(value) !== '0.001' ? parseFullNumber(value) : '';
  }
}

@Pipe({name: 'formatStringNumber'})
export class FormatStringNumberPipe implements PipeTransform {
  transform(valueString: string): any {
    if (valueString.toString().includes('.')) {
      valueString = valueString.toString().split('.')[0];
    }
    return valueString.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}

@Pipe({name: 'formatDigit'})
export class FormatDigitPipe implements PipeTransform {
  transform(amount: number, digit = 0) {
    let digitConvert = '1.' + digit + '-' + digit;
    return formatNumber(amount, 'en-GB', digitConvert);
  }
}
