
export enum TypeTransaction {
    IBCTransfer = 'IBC Transfer',
    IBCReceived = 'IBC Received',
    IBCAcknowledgement = 'IBC Acknowledgement',
    IBCUpdateClient = 'IBC Update Client',
    IBCTimeout = 'IBC Timeout',
    Send = 'Send',
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
    Fail = 'Fail' 
}

export enum StatusTransaction {
    Success = 'Success',
    Fail = 'Fail'
}

export enum CodeTransaction {
    Success = 0
}