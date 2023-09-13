import { LENGTH_CHARACTER } from "../../constants/common.constant";

const REGEX = {
  CONTRACT_ADDRESS: /aura([\w\d]+)/,
};

export function isContract(adr: string): boolean {
  if (adr) {
    const regex = new RegExp(REGEX.CONTRACT_ADDRESS);

    return (regex.test(adr) && adr.length === LENGTH_CHARACTER.CONTRACT);
  }
  return false;
}
