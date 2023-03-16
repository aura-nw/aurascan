export function shortenAddress(address: string, length = 6): string {
  return address ? `${new String(address).slice(0, length)}...${address.slice(address.length - length)}` : '';
}

export function shortenAddressStartEnd(address: string, start = 6, end = 10): string {
  return address ? `${new String(address).slice(0, start)}...${address.slice(address.length - end)}` : '';
}
