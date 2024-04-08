import { Pipe, type PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';

@Pipe({
  name: 'appCapacity',
})
export class CapacityPipe implements PipeTransform {
  transform(value: BigNumber.Value): unknown {
    const _num = BigNumber(value);

    return this.parseValue(_num);
  }

  parseValue(value: BigNumber) {
    const rouded = BigNumber(value.e).dividedToIntegerBy(3).toNumber();
    let _retValue = value.dividedBy(BigNumber(10).pow(3 * rouded)).toFormat(0);

    switch (rouded) {
      case 1:
        return `${_retValue}kB`;
      case 2:
        return `${_retValue}MB`;
      case 3:
        return `${_retValue}GB`;
      default:
        return `${value.toFixed()} bytes`;
    }
  }
}
