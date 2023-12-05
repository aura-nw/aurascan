import {Keplr} from "@keplr-wallet/types";

export async function getLeap(): Promise<Keplr | undefined>  {
  if(window.leap) {
    return window.leap;
  }

  if (document.readyState === 'complete') {
    return window.leap;
  }
  return undefined;
  // return new Promise((resolve) => {
  //   const documentStateChange = (event: Event) => {
  //     if (event.target && (event.target as Document).readyState === 'complete') {
  //       resolve(window.leap);
  //       // document.removeEventListener('readystatechange', documentStateChange);
  //     }
  //   };
  //
  //   document.addEventListener('readystatechange', documentStateChange);
  // });
}