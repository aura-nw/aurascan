export function getMetamask() {
  return (window as any).ethereum;
}

export async function checkNetwork(targetNetworkId: string) {
  const metamask = getMetamask();

  if (metamask) {
    const currentChainId = await metamask.request({
      method: 'eth_chainId',
    });

    return currentChainId == targetNetworkId;
  }

  return false;
}

export async function addNetwork(chain) {
  const metamask = getMetamask();

  const toHex = (num) => {
    return '0x' + num.toString(16);
  };
  const params = {
    chainId: toHex(chain.chainId), // A 0x-prefixed hexadecimal string
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: [chain.rpc],
    blockExplorerUrls: [
      chain.explorers && chain.explorers.length > 0 && chain.explorers[0].url ? chain.explorers[0].url : chain.infoURL,
    ],
  };

  return metamask.request({
    method: 'wallet_addEthereumChain',
    params: [params],
  });
}
