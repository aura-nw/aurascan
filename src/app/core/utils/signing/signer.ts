export async function getSigner(signingType = "keplr", chainId: string) {
  if (signingType === `keplr`) {
    return (window as any).getOfflineSigner(chainId);
  }

  throw new Error(`Signing via ${signingType} is not supported`);
}
