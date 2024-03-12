import { ethers, Provider } from 'ethers';

let provider: Provider;

export function getEthersProvider(rpc?: string) {
  if (provider) {
    return provider;
  }

  const _provider = ethers.getDefaultProvider(rpc);

  provider = _provider;

  return _provider;
}
