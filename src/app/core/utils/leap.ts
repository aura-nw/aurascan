import { Keplr } from '@keplr-wallet/types';

export async function getLeap(): Promise<Keplr | undefined> {
  if (window.leap) {
    return window.leap;
  }

  if (document.readyState === 'complete') {
    return window.leap;
  }
  return undefined;
}
