import { fromBech32, toBech32 } from '@cosmjs/encoding';
import { stripHexPrefix, toChecksumAddress } from 'crypto-addr-codec';
import { EWalletType } from '../../constants/wallet.constant';
import { LENGTH_CHARACTER } from '../../constants/common.constant';
import { getAddress } from 'ethers';

/**
 * Creates a Bech32 encoder function with the given prefix.
 *
 * @param {string} prefix - The prefix for the Bech32 encoding.
 * @return {function} - A function that accepts a Buffer and returns the Bech32 encoded string.
 */
function makeBech32Encoder(prefix: string) {
  return (data: Buffer) => toBech32(prefix, data);
}

/**
 * Returns a function that decodes a Bech32 string into a Buffer, using the provided currentPrefix.
 *
 * @param {string} input - The Bech32 string to decode.
 * @return {Buffer} The decoded Buffer.
 */
function makeBech32Decoder(currentPrefix: string) {
  return (input: string) => {
    const { prefix, data } = fromBech32(input);
    if (prefix !== currentPrefix) {
      throw Error('Unrecognised address format');
    }
    return Buffer.from(data);
  };
}

/**
 * Creates a checksummed hex decoder function.
 *
 * @return {(data: string) => Buffer} The checksummed hex decoder function
 */
function makeChecksummedHexDecoder() {
  return (data: string) => {
    return Buffer.from(stripHexPrefix(data), 'hex');
  };
}

/**
 * Returns a function that takes a Buffer and returns the checksummed hex encoding of the data.
 *
 * @param {number} chainId - The chain ID to be used for checksum calculation (optional)
 * @return {Function} - A function that takes a Buffer and returns the checksummed hex encoding
 */
function makeChecksummedHexEncoder(chainId?: number) {
  return (data: Buffer) => toChecksumAddress(data.toString('hex'), chainId || null);
}

/**
 * Converts a Bech32 address to an EVM address.
 *
 * @param {string} prefix - The prefix of the Bech32 address.
 * @param {string} bech32Address - The Bech32 address to be converted.
 * @return {string} The converted EVM address.
 */
export function convertBech32AddressToEvmAddress(prefix: string, bech32Address: string): string {
  try {
    const data = makeBech32Decoder(prefix)(bech32Address);
    return makeChecksummedHexEncoder()(data)?.toLowerCase();
  } catch (err) {
    return null;
  }
}

/**
 * Converts an EVM address to a Bech32 address with the specified prefix.
 *
 * @param {string} prefix - The prefix for the Bech32 address
 * @param {string} ethAddress - The Ethereum address to convert
 * @return {string} The converted Bech32 address
 */
export function convertEvmAddressToBech32Address(prefix: string, ethAddress: string): string {
  let result = ethAddress;
  if (result.startsWith(EWalletType.EVM)) {
    try {
      const data = makeChecksummedHexDecoder()(ethAddress);
      result = makeBech32Encoder(prefix)(data);
    } catch (err) {
      return null;
    }
  }
  return result?.toLowerCase();
}

/**
 * Transfer the address between EVM and Bech32 format based on the given prefix.
 *
 * @param {string} prefix - the prefix for the address format
 * @param {string} address - the address to be transferred
 * @return {object} the transferred address in both EVM and Bech32 format
 */
export function transferAddress(prefix: string, address: string) {
  if (address?.startsWith(prefix) && address?.length >= LENGTH_CHARACTER.CONTRACT) {
    return {
      accountEvmAddress: null,
      accountAddress: address,
    };
  }

  if (address?.startsWith(EWalletType.EVM)) {
    return {
      accountEvmAddress: address?.toLowerCase(),
      accountAddress: convertEvmAddressToBech32Address(prefix, address),
    };
  } else {
    return {
      accountAddress: address,
      accountEvmAddress: convertBech32AddressToEvmAddress(prefix, address),
    };
  }
}

export function getEvmChecksumAddress(address: string) {
  try {
    return getAddress(address);
  } catch (error) {
    return address;
  }
}

