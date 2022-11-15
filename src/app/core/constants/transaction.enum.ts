
export enum TypeTransaction {
  IBCTransfer = 'IBC Transfer',
  IBCReceived = 'IBC Received',
  IBCAcknowledgement = 'IBC Acknowledgement',
  IBCUpdateClient = 'IBC Update Client',
  IBCTimeout = 'IBC Timeout',
  IBCChannelOpenInit = 'IBC Channel Open Init',
  IBCConnectionOpenInit = 'IBC Connect Open Init',
  IBCCreateClient = 'IBC Create Client',
  IBCChannelOpenAck = 'IBC Channel Open Ack',
  Send = 'Send',
  Received = 'Receive',
  MultiSend = 'Multi Send',
  Delegate = 'Delegate',
  Undelegate = 'Undelegate',
  Redelegate = 'Redelegate',
  GetReward = 'Get Reward',
  SwapWithinBatch = 'Swap Within Batch',
  DepositWithinBatch = 'Deposit Within Batch',
  EditValidator = 'Edit Validator',
  CreateValidator = 'Create Validator',
  Unjail = 'Unjail',
  StoreCode = 'Store Code',
  InstantiateContract = 'Instantiate Contract',
  ExecuteContract = 'Execute Contract',
  ModifyWithdrawAddress = 'Modify Withdraw Address',
  JoinPool = 'Join pool',
  LockTokens = 'Lock Tokens (Start Farming)',
  JoinSwapExternAmountIn = 'Join Swap Extern Amount In',
  SwapExactAmountIn = 'Swap Exact Amount In',
  BeginUnlocking = 'Begin Unlocking',
  Vote = 'Vote',
  Vesting = 'Vesting',
  Deposit = 'Deposit',
  SubmitProposalTx = 'Submit Proposal',
  GetRewardCommission = 'Get Reward Commission',
  PeriodicVestingAccount = 'Periodic Vesting',
  BasicAllowance = 'Basic',
  PeriodicAllowance = 'Periodic',
  MsgGrantAllowance = "Grant Allowance",
  MsgRevokeAllowance = "Revoke Allowance",
  Fail = 'Fail'
}

export enum TRANSACTION_TYPE_ENUM {
  IBCTransfer = '/ibc.applications.transfer.v1.MsgTransfer',
  IBCReceived = '/ibc.core.channel.v1.MsgRecvPacket',
  IBCAcknowledgement = '/ibc.core.channel.v1.MsgAcknowledgement',
  IBCUpdateClient = '/ibc.core.client.v1.MsgUpdateClient',
  IBCTimeout = '/ibc.core.channel.v1.MsgTimeout',
  IBCChannelOpenInit = '/ibc.core.channel.v1.MsgChannelOpenInit',
  IBCConnectionOpenInit = '/ibc.core.connection.v1.MsgConnectionOpenInit',
  IBCCreateClient = '/ibc.core.client.v1.MsgCreateClient',
  IBCChannelOpenAck = '/ibc.core.channel.v1.MsgChannelOpenAck',
  Send = '/cosmos.bank.v1beta1.MsgSend',
  MultiSend = '/cosmos.bank.v1beta1.MsgMultiSend',
  Delegate = '/cosmos.staking.v1beta1.MsgDelegate',
  Undelegate = '/cosmos.staking.v1beta1.MsgUndelegate',
  Redelegate = '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  GetReward = '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  SwapWithinBatch = '/tendermint.liquidity.v1beta1.MsgSwapWithinBatch',
  DepositWithinBatch = '/tendermint.liquidity.v1beta1.MsgDepositWithinBatch',
  EditValidator = '/cosmos.staking.v1beta1.MsgEditValidator',
  CreateValidator = '/cosmos.staking.v1beta1.MsgCreateValidator',
  Unjail = '/cosmos.slashing.v1beta1.MsgUnjail',
  StoreCode = '/cosmwasm.wasm.v1.MsgStoreCode',
  InstantiateContract = '/cosmwasm.wasm.v1.MsgInstantiateContract',
  ExecuteContract = '/cosmwasm.wasm.v1.MsgExecuteContract',
  ModifyWithdrawAddress = '/cosmos.distribution.v1beta1.MsgSetWithdrawAddress',
  JoinPool = '/osmosis.gamm.v1beta1.MsgJoinPool',
  LockTokens = '/osmosis.lockup.MsgLockTokens',
  JoinSwapExternAmountIn = '/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn',
  SwapExactAmountIn = '/osmosis.gamm.v1beta1.MsgSwapExactAmountIn',
  BeginUnlocking = '/osmosis.lockup.MsgBeginUnlocking',
  Vote = '/cosmos.gov.v1beta1.MsgVote',
  Vesting = '/cosmos.vesting.v1beta1.MsgCreateVestingAccount',
  Deposit = '/cosmos.gov.v1beta1.MsgDeposit',
  SubmitProposalTx = '/cosmos.gov.v1beta1.MsgSubmitProposal',
  GetRewardCommission = '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission',
  PeriodicVestingAccount = '/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount',
  BasicAllowance = '/cosmos.feegrant.v1beta1.BasicAllowance',
  PeriodicAllowance = '/cosmos.feegrant.v1beta1.PeriodicAllowance',
  MsgGrantAllowance = '/cosmos.feegrant.v1beta1.MsgGrantAllowance',
  MsgRevokeAllowance = '/cosmos.feegrant.v1beta1.MsgRevokeAllowance',
  Fail = 'FAILED'
}

export enum StatusTransaction {
  Success = 'Success',
  Fail = 'Fail'
}

export enum CodeTransaction {
  Success = 0
}

export enum ModeExecuteTransaction {
  Default = 'default',
  Mint = 'mint',
  Burn = 'burn',
  Buy = 'buy'
}

export enum pipeTypeData {
  Number = 'number',
}