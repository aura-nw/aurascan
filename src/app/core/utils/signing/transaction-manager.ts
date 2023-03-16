import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { calculateFee, DeliverTxResponse, SigningStargateClient, StdFee } from '@cosmjs/stargate';
import { ChainInfo } from '@keplr-wallet/types';
import { TRANSACTION_TYPE_ENUM } from '../../constants/transaction.enum';
import { KEPLR_ERRORS } from '../../constants/wallet.constant';
import { messageCreators } from './messages';
import { getSigner } from './signer';

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
    const fee: StdFee = await getNetworkFee(network, senderAddress, messagesSend, '');
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

export async function getNetworkFee(network, address, messageType, memo = ''): Promise<StdFee> {
  //set default for multi gas
  let multiGas = 1.3;
  if (messageType?.typeUrl === TRANSACTION_TYPE_ENUM.MsgRevokeAllowance) {
    multiGas = 1.4;
  }

  let gasEstimation = 0;
  try {
    const signer = window.getOfflineSignerOnlyAmino(network.chainId);
    const onlineClient = await SigningCosmWasmClient.connectWithSigner(network.rpc, signer);
    gasEstimation = await onlineClient.simulate(address, Array.isArray(messageType) ? messageType : [messageType], '');
  } catch (e) {
    gasEstimation = 100000;
  }
  let gasPrice = network.gasPriceStep.average.toString() + network.currencies[0].coinMinimalDenom;
  let calGasPrice = calculateFee(Math.round(gasEstimation * multiGas), gasPrice);

  return {
    amount: [
      {
        denom: network.currencies[0].coinMinimalDenom,
        amount: (calGasPrice?.amount[0]?.amount || network.gasPriceStep.average)?.toString(),
      },
    ],
    gas: Math.round(gasEstimation * multiGas).toString(),
  };
}

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
