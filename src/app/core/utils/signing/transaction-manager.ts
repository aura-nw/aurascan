import { DeliverTxResponse, SigningStargateClient, StdFee } from '@cosmjs/stargate';
import { AURA_DENOM } from '../../constants/common.constant';
import { KEPLR_ERRORS } from '../../constants/wallet.constant';
import { messageCreators } from './messages';
import { getSigner } from './signer';
import { getFee } from './fee';

export async function createSignBroadcast(
  { messageType, message, senderAddress, network, signingType, chainId },
  validatorsCount?: number,
): Promise<any> {
  let error: KEPLR_ERRORS;
  let broadcastResult: DeliverTxResponse;
  if (signingType === 'extension') {
  } else {
    const signer = await getSigner(signingType, chainId);

    const client = await SigningStargateClient.connectWithSigner(network.rpc, signer);

    // success
    const messagesSend = messageCreators[messageType](senderAddress, message, network);
    console.log(validatorsCount);

    const fee: StdFee = {
      amount: [
        {
          denom: AURA_DENOM,
          amount: '1',
        },
      ],
      gas: validatorsCount ? getFee(messageType, validatorsCount) : getFee(messageType),
    };

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

/* 
{
  "code": 0,
  "height": 68078,
  "rawLog": "[{\"events\":[{\"type\":\"coin_received\",\"attributes\":[{\"key\":\"receiver\",\"value\":\"aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx\"},{\"key\":\"amount\",\"value\":\"1319861uaura\"}]},{\"type\":\"coin_spent\",\"attributes\":[{\"key\":\"spender\",\"value\":\"aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx\"},{\"key\":\"amount\",\"value\":\"1319861uaura\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward\"},{\"key\":\"sender\",\"value\":\"aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx\"},{\"key\":\"module\",\"value\":\"distribution\"},{\"key\":\"sender\",\"value\":\"aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx\"},{\"key\":\"sender\",\"value\":\"aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx\"},{\"key\":\"amount\",\"value\":\"1319861uaura\"}]},{\"type\":\"withdraw_rewards\",\"attributes\":[{\"key\":\"amount\",\"value\":\"1319861uaura\"},{\"key\":\"validator\",\"value\":\"auravaloper1jawldvd82kkw736c96s4jhcg8wz2ewwrnauhna\"}]}]}]",
  "transactionHash": "B71FCB70C151A20A69A509E47781D2533B6C21C5384CC5FC545F5C6022B2C6D6",
  "gasUsed": 119198,
  "gasWanted": 200000
}
*/

/* 
{
  "chain_id": "aura-testnet",
  "account_number": "45",
  "sequence": "13",
  "fee": {
    "gas": "280000",
    "amount": [
      {
        "denom": "uaura",
        "amount": "700000"
      }
    ]
  },
  "msgs": [
    {
      "type": "cosmos-sdk/MsgWithdrawDelegationReward",
      "value": {
        "delegator_address": "aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx",
        "validator_address": "auravaloper1ml6dsgu7tq09elyeuyxmve2l5wkvfzkl8wzz28"
      }
    },
    {
      "type": "cosmos-sdk/MsgWithdrawDelegationReward",
      "value": {
        "delegator_address": "aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx",
        "validator_address": "auravaloper1hnyjager4zrrq6cr85cd5a7rd37z6hsp92elnw"
      }
    }
  ],
  "memo": ""
}


*/
