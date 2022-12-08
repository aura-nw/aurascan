import { DeliverTxResponse, SigningStargateClient, StdFee } from '@cosmjs/stargate';
import { KEPLR_ERRORS } from '../../constants/wallet.constant';
import { messageCreators } from './messages';
import { getSigner } from './signer';
import { getFee } from './fee';
import { ChainInfo } from '@keplr-wallet/types';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';

export async function createSignBroadcast(
  {
    messageType,
    message,
    senderAddress,
    network,
    signingType,
    chainId,
  }: { messageType: any; message: any; senderAddress: any; network: ChainInfo; signingType: any; chainId: any },
  validatorsCount?: number,
  coin98Client?: any,
): Promise<any> {
  let error: KEPLR_ERRORS;
  let broadcastResult: DeliverTxResponse;
  if (signingType === 'extension') {
  } else {
    // success
    const messagesSend = messageCreators[messageType](senderAddress, message, network);
    // const fee: StdFee = getNetworkFee(network, messageType, validatorsCount);
    const fee = await getNetworkFee(network, senderAddress, messagesSend, '');
    console.log('fee estimate', messageType, fee);
    
    let client;

    if (coin98Client) {
      client = coin98Client;
    } else {
      const signer = await getSigner(signingType, chainId);

      client = await SigningStargateClient.connectWithSigner(network.rpc, signer);
    }

    try {
      broadcastResult = await client.signAndBroadcast(
        senderAddress,
        Array.isArray(messagesSend) ? messagesSend : [messagesSend],
        fee,
      );

      assertIsBroadcastTxSuccess(broadcastResult);
    } catch (e: any) {
      error = e.message;
    }

    return {
      hash: broadcastResult?.transactionHash || null,
      error,
    };
  }
}

export async function getNetworkFee(network, address, messageType, memo): Promise<any> {
  console.log(network);
  const signer = window.getOfflineSignerOnlyAmino(network.chainId);
  const onlineClient = await SigningCosmWasmClient.connectWithSigner(network.rpc, signer);
  // console.log(messageType);
  
  const gasEstimation = await onlineClient.simulate(address, [messageType], '');
  console.log(gasEstimation);
  
  return {
    amount: [
      {
        denom: network.currencies[0].coinMinimalDenom,
        amount: '1',
      },
    ],
    gas: (+gasEstimation * 1.3).toString(),
  };
}

// export function getNetworkFee(network, messageType, validatorsCount?: number): StdFee {
//   return {
//     amount: [
//       {
//         denom: network.currencies[0].coinMinimalDenom,
//         amount: '1',
//       },
//     ],
//     gas: validatorsCount ? getFee(messageType, validatorsCount) : getFee(messageType),
//   };
// }

export function assertIsBroadcastTxSuccess(res): DeliverTxResponse {
  if (!res) throw new Error(`Error sending transaction`);
  if (Array.isArray(res)) {
    if (res.length === 0) throw new Error(`Error sending transaction`);

    res.forEach(assertIsBroadcastTxSuccess);
  }

  if (res.error) {
    throw new Error(res.error);
  }

  // Sometimes we get back failed transactions, which shows only by them having a `code` property
  if (res.code) {
    const message = res.raw_log?.message ? JSON.parse(res.raw_log).message : res.raw_log;
    throw new Error(message);
  }

  if (!res.transactionHash) {
    const message = res.message;
    throw new Error(message);
  }

  return res;
}
