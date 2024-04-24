import { LENGTH_CHARACTER } from '../../constants/common.constant';
import { bech32 } from 'bech32';
import { EWalletType } from '../../constants/wallet.constant';

export function isContract(adr: string, addressPrefix: string): boolean {
  if (adr?.startsWith(addressPrefix) && adr?.length === LENGTH_CHARACTER.CONTRACT) {
    return true;
  }
  return false;
}

export function isAddress(adr: string, addressPrefix: string): boolean {
  if (adr?.startsWith(addressPrefix) && adr?.length >= LENGTH_CHARACTER.ADDRESS) {
    return true;
  }
  return false;
}

export function isEvmAddress(adr: string): boolean {
  if (adr?.startsWith(EWalletType.EVM) && adr?.length === LENGTH_CHARACTER.EVM_ADDRESS) {
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

export function isValidBench32Address(address: string, addressPrefix: string): boolean {
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
