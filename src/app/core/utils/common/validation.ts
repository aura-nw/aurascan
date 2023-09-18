import { LENGTH_CHARACTER } from "../../constants/common.constant";

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
