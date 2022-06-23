const REGEX = {
  CONTRACT_ADDRESS: /aura([\w\d]+)/,
};

export function isContract(adr: string): boolean {
  if (adr) {
    const regex = new RegExp(REGEX.CONTRACT_ADDRESS);

    return regex.test(adr);
  }
  return false;
}
