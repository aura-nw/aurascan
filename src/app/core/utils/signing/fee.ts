import { GAS_ESTIMATE } from 'src/app/core/constants/common.constant';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';

const MessageType = TRANSACTION_TYPE_ENUM;

enum EFees {
  Send = '100000',
  Delegate = '220000',
  Undelegate = '250000',
  Redelegate = '300000',
  GetReward = '150000',
  Vote = '100000',
  Default = '400000',
}

export function getFee(messageType: TRANSACTION_TYPE_ENUM | string, validatorsCount?: number): string {
  console.log(TRANSACTION_TYPE_ENUM[messageType], MessageType.GetReward);

  switch (TRANSACTION_TYPE_ENUM[messageType]) {
    case MessageType.Send:
      return EFees.Send;
    case MessageType.Delegate:
      return EFees.Delegate;
    case MessageType.Undelegate:
      return EFees.Undelegate;
    case MessageType.Redelegate:
      return EFees.Redelegate;
    case MessageType.GetReward:
      return validatorsCount > 1 ? (+EFees.GetReward * (0.4 * validatorsCount + 1)).toFixed(0) : EFees.GetReward;
    case MessageType.Vote:
      return EFees.Vote;
    default:
      return EFees.Default;
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
