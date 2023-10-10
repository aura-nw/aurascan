import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import { NgxMaskPipe } from 'ngx-mask';
import { TYPE_TRANSACTION } from '../constants/transaction.constant';
import { TRANSACTION_TYPE_ENUM } from '../constants/transaction.enum';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from '../services/common.service';
import { balanceOf } from '../utils/common/parsing';

@Pipe({ name: 'calDate' })
export class pipeCalDate implements PipeTransform {
  transform(value: string): string {
    const date = new Date(value);
    const today = new Date();
    const timeAgo = Math.round(Math.abs(today.getTime() - date.getTime()) / 1000) || 0;
    if (timeAgo > 60 * 60 * 24) {
      return Math.round(timeAgo / (60 * 60 * 24)) + ' day';
    }
    if (timeAgo > 60 * 60) {
      return Math.round(timeAgo / (60 * 60)) + 'h';
    }

    if (timeAgo > 60) {
      return Math.round(timeAgo / 60) + 'm';
    }
    return timeAgo + 's';
  }
}

@Pipe({ name: 'cutStringPipe' })
export class PipeCutString implements PipeTransform {
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

@Pipe({ name: 'stringEllipsis' })
export class StringEllipsis implements PipeTransform {
  transform(value: string, limit: number): string {
    if (value && value.length > limit) {
      let firstChar = limit ? value.substring(0, limit) : value.substring(0, 16);
      value = firstChar + '...';
    }
    return value;
  }
}

@Pipe({ name: 'imageS3' })
export class ImageURL implements PipeTransform {
  constructor(private environmentService: EnvironmentService) {}
  transform(value: string): string {
    const replacePath = /\..\//gi;
    value = value.replace(replacePath, '');
    const replaceLink = /assets\//gi;
    value = value.replace(replaceLink, this.environmentService.configValue.image_s3);
    return value;
  }
}

@Pipe({ name: 'customDate' })
export class CustomDate implements PipeTransform {
  transform(value: string, format: string) {
    const date = new Date(value);
    value = formatDate(date, format, 'en-US');
    return value;
  }
}

@Pipe({ name: 'balanceOf' })
export class BalanceOf implements PipeTransform {
  transform(amount: string | number, decimal = 6) {
    return +(new BigNumber(amount).toNumber() / Math.pow(10, decimal)).toFixed(decimal);
  }
}

@Pipe({ name: 'replaceIpfs' })
export class ReplaceIpfs implements PipeTransform {
  constructor(private environmentService: EnvironmentService) {}
  transform(value: string): string {
    return this.environmentService.configValue.ipfsDomain + value.replace('://', '/');
  }
}

@Pipe({ name: 'convertUauraToAura' })
export class ConvertUauraToAura implements PipeTransform {
  transform(value: number, powNum?: number): number {
    return value / Math.pow(10, powNum);
  }
}

@Pipe({ name: 'convertLogAmount' })
export class convertLogAmount implements PipeTransform {
  constructor(private commonService: CommonService, private mask: NgxMaskPipe) {}
  transform(value: string, getDenomOnly = false): string {
    let amount = value.match(/\d+/g)[0];
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

@Pipe({ name: 'decodeData' })
export class decodeData implements PipeTransform {
  transform(value: string): string {
    return atob(value);
  }
}

@Pipe({ name: 'displayTypeToolTip' })
export class displayTypeToolTip implements PipeTransform {
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
            } catch (e) {}
          }
          let action = Object.keys(dataTemp)[0];
          type = 'Contract: ' + action;
        } catch (e) {}
      } else {
        type = _.find(TYPE_TRANSACTION, { label: typeMsg })?.value || typeMsg.split('.').pop();
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

@Pipe({ name: 'convertSmallNumber' })
export class convertSmallNumber implements PipeTransform {
  constructor() {}
  transform(amount: number, decimal: number = 6): any {
    let valueString = (new BigNumber(amount).toNumber() / Math.pow(10, decimal)).toString();
    return displayFullNumber(valueString) !== '0.001' ? displayFullNumber(valueString) : '';
  }
}

function displayFullNumber(x) {
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split('e-')[1]);
    if (e) {
      x *= Math.pow(10, e - 1);
      x = '0.' + new Array(e).join('0') + x.toString().substring(2);
    }
  } else {
    var e = parseInt(x.toString().split('+')[1]);
    if (e > 20) {
      e -= 20;
      x /= Math.pow(10, e);
      x += new Array(e + 1).join('0');
    }
  }
  return x;
}
