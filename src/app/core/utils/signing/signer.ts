import { ESigningType } from "../../constants/wallet.constant";


export async function getSigner(signingType: ESigningType = ESigningType.Keplr, chainId: string) {
  if (signingType === ESigningType.Keplr) {
    return (window as any).getOfflineSigner(chainId);
  }

  throw new Error(`Signing via ${signingType} is not supported`);
}
