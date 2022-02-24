import { TypeTransaction } from "./transaction.enum";

export const TYPE_TRANSACTION = [
    { label: '/ibc.applications.transfer.v1.MsgTransfer', value: TypeTransaction.IBCTransfer },
    { label: '/ibc.core.channel.v1.MsgRecvPacket', value: TypeTransaction.IBCReceived },
    { label: '/ibc.core.channel.v1.MsgAcknowledgement', value: TypeTransaction.IBCAcknowledgement },
    { label: '/ibc.core.client.v1.MsgUpdateClient', value: TypeTransaction.IBCUpdateClient },
    { label: '/ibc.core.channel.v1.MsgTimeout', value: TypeTransaction.IBCTimeout },
    { label: '/COSMOS.BANK.V1BETA1.MSGSEND', value: TypeTransaction.Send },
    { label: '/cosmos.bank.v1beta1.MsgMultiSend', value: TypeTransaction.MultiSend },
    { label: '/cosmos.staking.v1beta1.MsgDelegate', value: TypeTransaction.Delegate },
    { label: '/cosmos.staking.v1beta1.MsgUndelegate', value: TypeTransaction.Undelegate },
    { label: '/cosmos.staking.v1beta1.MsgBeginRedelegate', value: TypeTransaction.Redelegate },
    { label: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', value: TypeTransaction.GetReward },
    { label: '/tendermint.liquidity.v1beta1.MsgSwapWithinBatch', value: TypeTransaction.SwapWithinBatch },
    { label: '/tendermint.liquidity.v1beta1.MsgDepositWithinBatch', value: TypeTransaction.DepositWithinBatch },
    { label: '/cosmos.staking.v1beta1.MsgEditValidator', value: TypeTransaction.EditValidator },
    { label: '/COSMOS.STAKING.V1BETA1.MSGCREATEVALIDATOR', value: TypeTransaction.CreateValidator },
    { label: '/COSMOS.SLASHING.V1BETA1.MSGUNJAIL', value: TypeTransaction.Unjail },
    { label: '/AURANW.AURA.WASM.MSGSTORECODE', value: TypeTransaction.StoreCode },
    { label: '/AURANW.AURA.WASM.MSGINSTANTIATECONTRACT', value: TypeTransaction.InstantiateContract },
    { label: '/AURANW.AURA.WASM.MSGEXECUTECONTRACT', value: TypeTransaction.ExecuteContract },
    { label: '/cosmos.distribution.v1beta1.MsgSetWithdrawAddress', value: TypeTransaction.ModifyWithdrawAddress },
    { label: 'FAILED', value: TypeTransaction.Fail }
  ]
