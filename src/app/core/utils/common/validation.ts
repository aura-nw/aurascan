import { ADDRESS_LENGTH_RULE } from '../../constants/common.constant';
import { bech32 } from 'bech32';

export function isContract(adr: string, addressPrefix: string): boolean {
  if (adr?.startsWith(addressPrefix) && adr?.replace(addressPrefix, '').length === ADDRESS_LENGTH_RULE.CONTRACT) {
    return true;
  }
  return false;
}

export function isAddress(adr: string, addressPrefix: string): boolean {
  if (adr?.startsWith(addressPrefix) && adr?.replace(addressPrefix, '').length === ADDRESS_LENGTH_RULE.ADDRESS) {
    return true;
  }
  return false;
}

export function isSafari(): boolean {
  const result =
    ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
  return result;
}

export function isValidBench32Address(address: string, addressPrefix = 'aura'): boolean {
  if (!address) {
    return false;
  }

  try {
    const { prefix: decodedPrefix } = bech32.decode(address);

    if (addressPrefix !== decodedPrefix) {
      throw new Error(`Unexpected prefix (expected: ${addressPrefix}, actual: ${decodedPrefix}`);
    }

    return true;
  } catch (error) {
    return false;
  }
}
