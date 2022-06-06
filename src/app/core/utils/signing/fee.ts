import { GAS_ESTIMATE } from 'src/app/core/constants/common.constant';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';

const MessageType = TRANSACTION_TYPE_ENUM;

export function getFee(messageType: TRANSACTION_TYPE_ENUM | string, validatorsCount?: number): string {
  console.log(TRANSACTION_TYPE_ENUM[messageType], MessageType.GetReward);

  switch (TRANSACTION_TYPE_ENUM[messageType]) {
    case MessageType.Send:
      return '80000';
    case MessageType.Delegate:
      return '180000';
    case MessageType.Undelegate:
      return '200000';
    case MessageType.Redelegate:
      return '300000';
    case MessageType.GetReward:
      const f = 130000 * ((0.4 * validatorsCount )+ 1);
      console.log(f, validatorsCount);

      return (130000 * (0.4 * validatorsCount + 1)).toFixed(0);
    case MessageType.Vote:
      return '70000';
    default:
      return GAS_ESTIMATE.DEFAULT;
  }
}

/* 
https://aura-network.notion.site/Transactions-3f138c3a969c4f42acd5798791cfff95
    /ibc.applications.transfer.v1.MsgTransfer
    /ibc.core.channel.v1.MsgRecvPacket
    /ibc.core.channel.v1.MsgAcknowledgement
    /ibc.core.client.v1.MsgUpdateClient

    /COSMOS.BANK.V1BETA1.MSGSEND
    /cosmos.bank.v1beta1.MsgMultiSend
    /cosmos.staking.v1beta1.MsgDelegate
    /cosmos.staking.v1beta1.MsgUndelegate
    /cosmos.staking.v1beta1.MsgBeginRedelegate
    /cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward
    /tendermint.liquidity.v1beta1.MsgSwapWithinBatch

    /cosmos.staking.v1beta1.MsgEditValidator
    /COSMOS.STAKING.V1BETA1.MSGCREATEVALIDATOR
    /COSMOS.SLASHING.V1BETA1.MSGUNJAIL
    /AURANW.AURA.WASM.MSGSTORECODE
    /AURANW.AURA.WASM.MSGINSTANTIATECONTRACT
    /AURANW.AURA.WASM.MSGEXECUTECONTRACT
    /cosmos.distribution.v1beta1.MsgSetWithdrawAddress
*/
