import { Pipe, type PipeTransform } from '@angular/core';
import { getEvmChecksumAddress } from '../utils/common/address-converter';

@Pipe({
  name: 'appEvmAddress',
})
export class EvmAddressPipe implements PipeTransform {
  transform(value: string): string {
    return getEvmChecksumAddress(value);
  }
}
