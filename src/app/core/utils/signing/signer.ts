

export async function getSigner(
  signingType = 'keplr',
  { address, password },
  chainId,
  ledgerTransport
) {
  if (signingType === `local`) {
    // const { Secp256k1HdWallet } = await import('@cosmjs/launchpad')
    // const { wallet: serializedWallet } = getWallet(address)
    // const wallet = await Secp256k1HdWallet.deserialize(
    //   serializedWallet,
    //   password
    // )
    // return wallet
  } else if (signingType === `ledger`) {
    // const { ledger } = await getLedger(ledgerTransport)
    // return ledger
  } else if (signingType === `keplr`) {
    return (window as any).getOfflineSigner(chainId)
  }

  throw new Error(`Signing via ${signingType} is not supported`)
}
