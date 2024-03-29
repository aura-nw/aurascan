const anyWindow = window as any;

export const isKeplrExtention = () => !!anyWindow?.keplr;
export const isKeplrCoin98Extention = () => !!anyWindow?.keplr?.isCoin98;
export const isKeplrLeapExtention = () => !!anyWindow?.keplr?.mode.includes('core');
export const isCoin98Extention = () => !!anyWindow?.coin98?.keplr?.isDesktop;
export const isLeapExtention = () => !!anyWindow?.leap?.mode?.includes('core');
export const isMetamaskExtention = () => !!anyWindow?.ethereum?.isMetaMask;

export const isCoin98Browser = () => !!anyWindow?.coin98?.isMobile;
export const isLeapBrowser = () => !!anyWindow?.leap?.mode?.includes('mobile');
export const isKeplrBrowser = () => !!anyWindow?.keplr?.mode?.includes('mobile');
