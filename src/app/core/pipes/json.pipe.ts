import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { JsonPrettyPrint } from '../utils/common/json-viewer';

@Pipe({
  name: 'appJson',
})
export class JsonPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    if (_.get(args, '[0].checkType')) {
      return this.transformValue(value);
    }
    return typeof value == 'object' ? JsonPrettyPrint(value) : value;
  }

  transformValue(value) {
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value);
  }
}
