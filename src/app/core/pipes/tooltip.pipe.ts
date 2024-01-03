import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { TYPE_TRANSACTION } from '../constants/transaction.constant';
import { TRANSACTION_TYPE_ENUM } from '../constants/transaction.enum';
import { NameTagService } from '../services/name-tag.service';

@Pipe({ name: 'checkDisplayTooltip' })
export class CheckDisplayTooltip implements PipeTransform {
  constructor(public nameTagService: NameTagService) {}
  transform(address) {
    return this.nameTagService.checkDisplayTooltip(address);
  }
}

@Pipe({ name: 'displayTypeToolTip' })
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
            } catch (e) {}
          }
          let action = Object.keys(dataTemp)[0];
          type = 'Contract: ' + action;
        } catch (e) {}
      } else {
        type = _.find(TYPE_TRANSACTION, { label: typeMsg })?.value || typeMsg.split('.').pop().replace('Msg', '');
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
