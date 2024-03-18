import { ethers, Provider } from 'ethers';

const anyWindow = window as any;

let provider: Provider;

export function getEthersProvider(rpc?: string) {
  if (provider) {
    return provider;
  }

  const _provider = ethers.getDefaultProvider(rpc);

  provider = _provider;

  return _provider;
}

export async function getSigner(rpc?: string) {
  if (anyWindow.ethereum) {
    const provider = new ethers.BrowserProvider(anyWindow.ethereum);

    return provider.getSigner();
  }

  return undefined;
}
