const anyWindow = window as any;

export const isKeplrExisted = () => !!anyWindow?.keplr;
export const isCoin98Existed = () => !!anyWindow?.coin98;
export const isLeapExisted = () => !!anyWindow?.leap;
export const isMetamaskExisted = () => !!anyWindow?.ethereum;

export const isCoin98Browser = () => !!anyWindow?.coin98?.isMobile;
export const isLeapBrowser = () => !!anyWindow?.leap?.mode?.includes('mobile');
export const isKeplrBrowser = () => !!anyWindow?.keplr?.mode?.includes('mobile');
