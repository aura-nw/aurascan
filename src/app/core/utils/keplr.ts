import { Keplr } from '@keplr-wallet/types';
import { KEPLR_ERRORS } from '../constants/wallet.constant';

export async function getKeplr(): Promise<Keplr | undefined> {
  if ((window as any).keplr) {
    return (window as any).keplr;
  }

  if (document.readyState === 'complete') {
    return (window as any).keplr;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (event.target && (event.target as Document).readyState === 'complete') {
        resolve((window as any).keplr);
        document.removeEventListener('readystatechange', documentStateChange);
      }
    };

    document.addEventListener('readystatechange', documentStateChange);
  });
}

// export async function keplrSuggestChain(chainId: string): Promise<any> {
//   if (ChainsInfo[chainId]) {
//     return (await getKeplr()).experimentalSuggestChain(ChainsInfo[chainId]).catch((e: Error) => {
//       throw e;
//     });
//   }

//   return KEPLR_ERRORS.NoChainInfo;
// }

export async function keplrSuggestChain(chainInfo): Promise<any> {
  if (chainInfo) {
    return (await getKeplr()).experimentalSuggestChain(chainInfo).catch((e: Error) => {
      throw e;
    });
  }

  return KEPLR_ERRORS.NoChainInfo;
}

export function getKeplrError(err: any): KEPLR_ERRORS {
  if (err.toUpperCase().includes(KEPLR_ERRORS.NoChainInfo)) {
    return KEPLR_ERRORS.NoChainInfo;
  } else if (err.toUpperCase().includes(KEPLR_ERRORS.NOT_EXIST)) {
    return KEPLR_ERRORS.NOT_EXIST;
  } else if (err.toUpperCase().includes(KEPLR_ERRORS.RequestRejected)) {
    return KEPLR_ERRORS.RequestRejected;
  }

  return KEPLR_ERRORS.Failed;
}

export async function handleErrors(err: Error, chainId: string): Promise<string> {
  const error = getKeplrError(err.message);
  switch (error) {
    case KEPLR_ERRORS.NoChainInfo:
      // this.keplrSuggestChain(chainId);
      return null;
    case KEPLR_ERRORS.NOT_EXIST:
      window.open('https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en');
      return null;
    default:
      return err.message;
  }
}
