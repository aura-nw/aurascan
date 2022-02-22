export const NAVBARITEM = [
    {
        link: '/primary-market',
        label: 'Thị trường sơ cấp'
    },
    {
        link: '/2',
        label: 'Thị trường thứ cấp'
    },
    {
        link: '/exchange',
        label: 'Giao Dịch'
    },
    {
        link: '/account',
        label: 'Tài khoản'
    }
];

export const MY_FORMATS = {
    parse: {
        dateInput: 'LL',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'YYYY',
    },
};

export const NETWORK = [
    {
        value: 1,
        label: 'Fabric',
        icon: '/assets/images/icons/fabric.png'
    },
    {
        value: 2,
        label: 'Cosmos',
        icon: '/assets/images/icons/chain_cosmos.svg'
    }
];

export const TYPE_TRANSACTION = [
    { label: '/ibc.applications.transfer.v1.MsgTransfer', value: 'IBC Transfer' },
    { label: '/ibc.core.channel.v1.MsgRecvPacket', value: 'IBC Received' },
    { label: '/ibc.core.channel.v1.MsgAcknowledgement', value: 'IBC Acknowledgement' },
    { label: '/ibc.core.client.v1.MsgUpdateClient', value: 'IBC Update Client' },
    { label: '1', value: 'IBC Timeout' },
    { label: '/COSMOS.BANK.V1BETA1.MSGSEND', value: 'Send' },
    { label: '/cosmos.bank.v1beta1.MsgMultiSend', value: 'Multi Send' },
    { label: '/cosmos.staking.v1beta1.MsgDelegate', value: 'Delegate' },
    { label: '/cosmos.staking.v1beta1.MsgUndelegate', value: 'Undelegate' },
    { label: '/cosmos.staking.v1beta1.MsgBeginRedelegate', value: 'Redelegate' },
    { label: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', value: 'Get Reward' },
    { label: '/tendermint.liquidity.v1beta1.MsgSwapWithinBatch', value: 'Swap Within Batch' },
    { label: '/tendermint.liquidity.v1beta1.MsgDepositWithinBatch', value: 'Deposit Within Batch' },
    { label: '/cosmos.staking.v1beta1.MsgEditValidator', value: 'Edit Validator' },
    { label: '/COSMOS.STAKING.V1BETA1.MSGCREATEVALIDATOR', value: 'Create Validator' },
    { label: '/COSMOS.SLASHING.V1BETA1.MSGUNJAIL', value: 'Unjail' },
    { label: '/AURANW.AURA.WASM.MSGSTORECODE', value: 'Store Code' },
    { label: '/AURANW.AURA.WASM.MSGINSTANTIATECONTRACT', value: 'Instantiate Contract' },
    { label: '/AURANW.AURA.WASM.MSGEXECUTECONTRACT', value: 'Execute Contract' },
    { label: '/cosmos.distribution.v1beta1.MsgSetWithdrawAddress', value: 'Modify Withdraw Address' },
    { label: 'FAILED', value: 'Fail' }
  ]