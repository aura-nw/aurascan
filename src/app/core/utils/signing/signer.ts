import { ESigningType } from '../../constants/wallet.constant';

export async function getSigner(signingType: ESigningType = ESigningType.Keplr, chainId: string) {
  if (signingType === ESigningType.Keplr) {
    return await (window as any).getOfflineSignerAuto(chainId);
  } else if (signingType === ESigningType.Leap) {
    return await (window as any).leap.getOfflineSignerAuto(chainId);
  } else throw new Error(`Signing via ${signingType} is not supported`);
}
