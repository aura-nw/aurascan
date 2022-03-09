import { TypeTransaction } from "./transaction.enum";

export const TYPE_TRANSACTION = [
    { label: '/ibc.applications.transfer.v1.MsgTransfer', value: TypeTransaction.IBCTransfer },
    { label: '/ibc.core.channel.v1.MsgRecvPacket', value: TypeTransaction.IBCReceived },
    { label: '/ibc.core.channel.v1.MsgAcknowledgement', value: TypeTransaction.IBCAcknowledgement },
    { label: '/ibc.core.client.v1.MsgUpdateClient', value: TypeTransaction.IBCUpdateClient },
    { label: '/ibc.core.channel.v1.MsgTimeout', value: TypeTransaction.IBCTimeout },
    { label: '/cosmos.bank.v1beta1.MsgSend', value: TypeTransaction.Send },
    { label: '/cosmos.bank.v1beta1.MsgMultiSend', value: TypeTransaction.MultiSend },
    { label: '/cosmos.staking.v1beta1.MsgDelegate', value: TypeTransaction.Delegate },
    { label: '/cosmos.staking.v1beta1.MsgUndelegate', value: TypeTransaction.Undelegate },
    { label: '/cosmos.staking.v1beta1.MsgBeginRedelegate', value: TypeTransaction.Redelegate },
    { label: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', value: TypeTransaction.GetReward },
    { label: '/tendermint.liquidity.v1beta1.MsgSwapWithinBatch', value: TypeTransaction.SwapWithinBatch },
    { label: '/tendermint.liquidity.v1beta1.MsgDepositWithinBatch', value: TypeTransaction.DepositWithinBatch },
    { label: '/cosmos.staking.v1beta1.MsgEditValidator', value: TypeTransaction.EditValidator },
    { label: '/cosmos.staking.v1beta1.MsgCreateValidator', value: TypeTransaction.CreateValidator },
    { label: '/cosmos.slashing.v1beta1.MsgUnjail', value: TypeTransaction.Unjail },
    { label: '/auranw.aura.wasm.MsgStoreCode', value: TypeTransaction.StoreCode },
    { label: '/auranw.aura.wasm.MsgInstantiateContract', value: TypeTransaction.InstantiateContract },
    { label: '/auranw.aura.wasm.MsgExecuteContract', value: TypeTransaction.ExecuteContract },
    { label: '/cosmos.distribution.v1beta1.MsgSetWithdrawAddress', value: TypeTransaction.ModifyWithdrawAddress },
    { label: 'FAILED', value: TypeTransaction.Fail }
  ]
