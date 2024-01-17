import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { TYPE_TRANSACTION } from '../constants/transaction.constant';
import { TRANSACTION_TYPE_ENUM } from '../constants/transaction.enum';
import { CommonService } from '../services/common.service';

@Pipe({ name: 'ellipsis' })
export class EllipsisPipe implements PipeTransform {
  transform(value: string, start: number, end: number = 0): string {
    const length = value?.length;
    if (length > start + end) {
      const firstPart = start ? value.slice(0, start) : '';
      const lastPart = end ? value.slice(length - end, length) : '';
      const middleText = start != 0 ? '...' : '';
      return `${firstPart}${middleText}${lastPart}`;
    }
    return value;
  }
}

@Pipe({ name: 'combineTxsMsg' })
export class CombineTxsMsgPipe implements PipeTransform {
  transform(value: any[]): string {
    const lst: string[] = value.map((element: unknown) => {
      element = element['content'] || element;
      const msgType = element['type'] || element['@type'];
      let type: string;
      if (msgType === TRANSACTION_TYPE_ENUM.ExecuteContract) {
        try {
          let msg = _.get(element, 'content.msg') || _.get(element, 'msg');
          if (typeof msg === 'string') {
            try {
              msg = JSON.parse(msg);
            } catch (e) {}
          }
          let action = Object.keys(msg)[0];
          type = 'Contract: ' + action;
        } catch (e) {}
      } else {
        type = _.find(TYPE_TRANSACTION, { label: msgType })?.value || msgType.split('.').pop().replace('Msg', '');
      }

      return type;
    });
    if (lst?.length > 5) {
      return lst.splice(0, 4).join(', ').concat(', ...');
    }

    return lst.splice(0, 3).join(', ');
  }
}

@Pipe({ name: 'isContract' })
export class IsContractPipe implements PipeTransform {
  constructor(private commonService: CommonService) {}
  transform(address: string): boolean {
    return this.commonService.isValidContract(address);
  }
}
