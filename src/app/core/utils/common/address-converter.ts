import { fromBech32, toBech32 } from '@cosmjs/encoding';
import { ETH } from '@evmos/address-converter';

function makeBech32Encoder(prefix: string) {
  return (data: Buffer) => toBech32(prefix, data);
}

function makeBech32Decoder(currentPrefix: string) {
  return (input: string) => {
    const { prefix, data } = fromBech32(input);
    if (prefix !== currentPrefix) {
      throw Error('Unrecognised address format');
    }
    return Buffer.from(data);
  };
}

export function convertBech32AddressToEvmAddress(prefix: string, bech32Address: string): string {
  const data = makeBech32Decoder(prefix)(bech32Address);
  return ETH.encoder(data);
}

export function convertEvmAddressToBech32Address(prefix: string, ethAddress: string): string {
  let result = ethAddress;
  if (result.startsWith('0x')) {
    const data = ETH.decoder(ethAddress);
    result = makeBech32Encoder(prefix)(data);
  }
  return result;
}
