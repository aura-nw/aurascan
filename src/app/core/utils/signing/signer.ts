import { ESigningType } from '../../constants/wallet.constant';

export async function getSigner(signingType: ESigningType = ESigningType.Keplr, chainId: string) {
  if (signingType === ESigningType.Keplr) {
    return await window.getOfflineSignerAuto(chainId);
  }

  throw new Error(`Signing via ${signingType} is not supported`);
}
