export const stakeAbi = [
  {
    name: 'delegate',
    type: 'function',
    inputs: [
      {
        name: 'delegatorAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'validatorAddress',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'success',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    name: 'undelegate',
    type: 'function',
    inputs: [
      {
        name: 'delegatorAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'validatorAddress',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'completionTime',
        type: 'int64',
        internalType: 'int64',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    name: 'redelegate',
    type: 'function',
    inputs: [
      {
        name: 'delegatorAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'validatorSrcAddress',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'validatorDstAddress',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'completionTime',
        type: 'int64',
        internalType: 'int64',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    name: 'claimRewards',
    type: 'function',
    inputs: [
      { name: 'delegatorAddress', type: 'address', internalType: 'address' },
      { name: 'maxRetrieve', type: 'uint32', internalType: 'uint32' },
    ],
    outputs: [{ name: 'success', type: 'bool', internalType: 'bool' }],
    stateMutability: 'nonpayable',
  },
];