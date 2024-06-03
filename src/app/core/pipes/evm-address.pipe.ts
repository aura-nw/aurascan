import { Pipe, type PipeTransform } from '@angular/core';
import { getEvmChecksumAddress } from '../utils/common/address-converter';
import { EWalletType } from '../constants/wallet.constant';

@Pipe({
  name: 'beautyAddress',
})
export class EvmAddressPipe implements PipeTransform {
  transform(value: string): string {
    console.log(value, getEvmChecksumAddress(value));
    if (!value?.startsWith(EWalletType.EVM)) return value;

    return getEvmChecksumAddress(value);
  }
}
