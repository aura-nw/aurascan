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
  try {
    await metamask.request({
      method: 'wallet_addEthereumChain',
      params: [params],
    });
  } catch (addError) {
    console.error(addError);
  }
}

export const hex2a = (hex: string) => {
  if(!hex && typeof hex != 'string') return "";
  const data = hex.toString();
  let str = '';
  for (let i = 0; i < data.length; i += 2)
      str += String.fromCharCode(parseInt(data.substr(i, 2), 16));
  return str;
}

export const getValueOfKeyInObject = (obj: object, key: string) => {
  let result = null;
  if(obj instanceof Array) {
    for(const element of obj) {
      result = getValueOfKeyInObject(element, key);
      if (result) {
        break;
      }   
    }
  } else {
    for(let prop in obj) {
      if(prop === key) {
        return obj[key] || {};
      }
      if(obj[prop] instanceof Object || obj[prop] instanceof Array) {
        result = getValueOfKeyInObject(obj[prop], key);
        if (result) {
          break;
        }
      } 
    }
  }
  return result;
}
