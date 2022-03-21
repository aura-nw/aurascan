import { SigningStargateClient } from "@cosmjs/stargate";
import {
  makeSignDoc,
  encodePubkey,
  // coins,
} from "@cosmjs/proto-signing";
import { toBase64 } from "@cosmjs/encoding";
import { getSigner } from "./signer";
import { messageCreators } from "./messages";
// import fees from '~/common/fees'
// import network from '~/common/network'
// import { signWithExtension } from '~/common/extension-utils'

// export function getFees(transactionType, feeDenom) {
//   const { gasEstimate, feeOptions } = fees.getFees(transactionType)
//   const fee = feeOptions.find(({ denom }) => denom === feeDenom)
//   const coinLookup = network.getCoinLookup(fee.denom, 'viewDenom')
//   // converting view fee to on chain fee
//   const convertedFee = [
//     {
//       amount: BigNumber(fee.amount)
//         .div(coinLookup.chainToViewConversionFactor)
//         .toString(),
//       denom: coinLookup.chainDenom,
//     },
//   ]
//   return {
//     gasEstimate: String(gasEstimate),
//     fee: convertedFee,
//   }
// }

export async function createSignBroadcast({
  messageType,
  message,
  senderAddress,
  accountInfo,
  network,
  signingType,
  password,
  HDPath,
  feeDenom,
  chainId,
  memo,
  ledgerTransport,
}): Promise<any> {
  const feeData = {
    gasEstimate: String(8000000),
    fee: 1,
  };
  const transactionData = {
    ...feeData,
    memo,
    chainId,
    accountNumber: accountInfo.accountNumber,
    accountSequence: accountInfo.sequence,
  };
  // console.log('account', accountInfo)
  let signedTx;
  let broadcastResult;
  if (signingType === "extension") {
    // signedTx = await signWithExtension(
    //   messageType,
    //   message,
    //   transactionData,
    //   senderAddress,
    //   network
    // )
  } else {
    const signer = await getSigner(
      signingType,
      {
        address: senderAddress,
        password,
      },
      chainId,
      ledgerTransport
    );

    const account = await signer.getAccounts();

    const messages = messageCreators[messageType](
      senderAddress,
      message,
      network
    );

    const bodyBytes: any = [].concat(messages);

    const signDoc = makeSignDoc(
      bodyBytes,
      {
        amount: transactionData.fee[0].amount,
        gas: transactionData.gasEstimate,
      } as any,
      chainId,
      memo || ""
      // accountInfo.accountNumber,
      // accountInfo.sequence
    );

    const pubkey = encodePubkey({
      type: "tendermint/PubKeySecp256k1",
      value: toBase64(account[0].pubkey),
    });
    const sequence = accountInfo.sequence;
    // const authInfoBytes = makeAuthInfoBytes(
    //   [{ pubkey, sequence }],
    //   transactionData.fee,
    //   transactionData.gasEstimate
    // )
    // console.log('authInfoBytes', authInfoBytes)
    // const { signed, signature } = await signer.sign(senderAddress, signDoc)
    const client = await SigningStargateClient.connectWithSigner(
      network.rpcURL,
      signer
    );
    // console.log('client', client)
    // signedTx = makeStdTx(signed, signature)
    // console.log('signedTx', signed)
    // console.log('signature', signature)

    // success
    const messagesSend = messageCreators[messageType](
      senderAddress,
      message,
      network
    );

    const fee: any = {
      amount: [
        {
          denom: "uaura",
          amount: "20",
        },
      ],
      gas: "200000",
    };
    broadcastResult = await client.signAndBroadcast(
      senderAddress,
      [messagesSend],
      fee
    );
    console.log("broadcastResult", broadcastResult);

    assertIsBroadcastTxSuccess(broadcastResult);

    return {
      hash: broadcastResult.transactionHash,
    };
  }
}

export function assertIsBroadcastTxSuccess(res) {
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
    const message = res.raw_log.message
      ? JSON.parse(res.raw_log).message
      : res.raw_log;
    throw new Error(message);
  }

  if (!res.transactionHash) {
    const message = res.message;
    throw new Error(message);
  }

  return res;
}

// export async function pollTxInclusion(txHash, iteration = 0) {
//   const MAX_POLL_ITERATIONS = 30
//   let txFound = false
//   try {
//     await fetch(`${network.apiURL}/txs/${txHash}`).then((res) => {
//       if (res.status === 200) {
//         txFound = true
//       }
//     })
//   } catch (err) {
//     // ignore error
//   }
//   if (txFound) {
//     return true
//   } else if (iteration < MAX_POLL_ITERATIONS) {
//     await new Promise((resolve) => setTimeout(resolve, 2000))
//     return pollTxInclusion(txHash, iteration + 1)
//   } else {
//     throw new Error(
//       `The transaction wasn't included in time. Check explorers for the transaction hash ${txHash}.`
//     )
//   }

/* 
{
  "messageType": "ClaimRewardsTx",
  "message": {
    "amounts": [
      {
        "denom": "AURA",
        "amount": 3.802484
      }
    ],
    "from": ["auravaloper1hnyjager4zrrq6cr85cd5a7rd37z6hsp92elnw"]
  },
  "senderAddress": "aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx",
  "accountInfo": {
    "accountNumber": "45",
    "sequence": "10"
  },
  "network": {
    "id": "aura-testnet",
    "name": "Aura",
    "description": "Cosmos is a network of independent parallel blockchains, powered by BFT consensus algorithms like Tendermint.",
    "logo": "logo.svg",
    "website": "https://aura.network",
    "apiURL": "https://rpc-testnet.aura.network",
    "rpcURL": "https://tendermint-testnet.aura.network",
    "stakingDenom": "AURA",
    "coinLookup": [
      {
        "viewDenom": "AURA",
        "chainDenom": "uaura",
        "chainToViewConversionFactor": 0.000001,
        "icon": "currencies/muon.png"
      }
    ],
    "addressPrefix": "aura",
    "validatorAddressPrefix": "auravaloper",
    "validatorConsensusaddressPrefix": "auravalcons",
    "HDPath": "m/44'/118'/0'/0/0",
    "lockUpPeriod": "3 days",
    "fees": {
      "default": {
        "gasEstimate": 80000,
        "feeOptions": [
          {
            "denom": "AURA",
            "amount": 0.001
          }
        ]
      }
    },
    "icon": "https://lunie.fra1.digitaloceanspaces.com/network-icons/cosmos.png",
    "localSigning": false
  },
  "signingType": "keplr",
  "password": null,
  "HDPath": "m/44'/118'/0'/0/0",
  "feeDenom": "AURA",
  "chainId": "aura-testnet"
}
 */