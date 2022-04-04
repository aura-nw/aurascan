export function shortenAddress(address: string, length = 6): string {
  return address ? `${new String(address).slice(0, length)}...${address.slice(address.length - length)}` : '';
}
