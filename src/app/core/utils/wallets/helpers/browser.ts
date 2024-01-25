export const isCoin98Browser = () => (window as any)?.coin98?.isMobile;
export const isLeapBrowser = () => (window as any)?.leap?.mode?.includes('mobile');
