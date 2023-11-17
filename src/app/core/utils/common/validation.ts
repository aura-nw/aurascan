import { LENGTH_CHARACTER } from '../../constants/common.constant';

const REGEX = {
  CONTRACT_ADDRESS: /aura([\w\d]+)/,
};

export function isContract(adr: string): boolean {
  if (adr?.startsWith('aura') && adr?.length === LENGTH_CHARACTER.CONTRACT) {
    return true;
  }
  return false;
}

export function isAddress(adr: string): boolean {
  if (adr?.startsWith('aura') && adr?.length === LENGTH_CHARACTER.ADDRESS) {
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
