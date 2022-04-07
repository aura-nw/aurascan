import BigNumber from 'bignumber.js';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { MsgDelegate, MsgUndelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx';
// Bank

/* istanbul ignore next */
export function SendTx(senderAddress, { to, amounts }, network) {
  const msg = MsgSend.fromPartial({
    fromAddress: senderAddress,
    toAddress: to[0],
    amount: amounts.map((amount) => Coin(amount, network.coinLookup)),
  });
  return {
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
    value: msg,
  };
  // return {
  //   type: `cosmos-sdk/MsgSend`,
  //   value: {
  //     from_address: senderAddress,
  //     to_address: to[0],
  //     amount: amounts.map((amount) => Coin(amount, network.coinLookup)),
  //   },
  // }
}

// Staking
export function StakeTx(senderAddress, { to, amount }, network) {
  /* istanbul ignore next */
  const msg = MsgDelegate.fromPartial({
    delegatorAddress: senderAddress,
    validatorAddress: to[0],
    amount: {
      amount: amount.amount + '',
      denom: 'uaura',
    },
  });
  return {
    typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
    value: msg,
  };
  // return {
  //   type: `cosmos-sdk/MsgDelegate`,
  //   value: {
  //     delegator_address: senderAddress,
  //     validator_address: to[0],
  //     amount: Coin(amount, network.coinLookup),
  //   },
  // }
}

export function UnstakeTx(senderAddress, { from, amount }, network) {
  /* istanbul ignore next */
  return {
    typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
    value: MsgUndelegate.fromPartial({
      delegatorAddress: senderAddress,
      validatorAddress: from[0],
      amount: Coin(amount, network.coinLookup),
    }),
  };
  // return {
  //   type: `cosmos-sdk/MsgUndelegate`,
  //   value: {
  //     validator_address: from[0],
  //     delegator_address: senderAddress,
  //     amount: Coin(amount, network.coinLookup),
  //   },
  // }
}

export function ClaimRewardsTx(
  senderAddress,
  {
    // amounts,
    from,
  },
) {
  /* istanbul ignore next */
  // return {
  //   // typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegationReward",
  //   typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
  //   value: MsgWithdrawDelegatorReward.fromPartial({
  //     delegatorAddress: senderAddress,
  //     validatorAddress: validatorAddress,
  //   }

  // }

  const msg = MsgWithdrawDelegatorReward.fromPartial({
    delegatorAddress: senderAddress,
    validatorAddress: from[0],
  });

  return {
    typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
    value: msg,
  };
}

export function VoteTx(senderAddress, { proposalId, voteOption }) {
  const chainVoteOption = {
    Yes: 1,
    Abstain: 2,
    No: 3,
    NoWithVeto: 4,
  }[voteOption];
  /* istanbul ignore next */
  return {
    type: `cosmos-sdk/MsgVote`,
    value: {
      voter: senderAddress,
      proposal_id: proposalId,
      option: chainVoteOption,
    },
  };
}

export function DepositTx(senderAddress, { proposalId, amount }, network) {
  /* istanbul ignore next */
  return {
    type: `cosmos-sdk/MsgDeposit`,
    value: {
      depositor: senderAddress,
      proposal_id: proposalId,
      amount: [Coin(amount, network.coinLookup)],
    },
  };
}

export function Coin({ amount, denom }, coinLookup) {
  const lookup = coinLookup.find(({ viewDenom }) => viewDenom === denom);
  return {
    amount: new BigNumber(amount).dividedBy(lookup.chainToViewConversionFactor).toFixed(),
    denom: lookup.chainDenom,
  };
}

export const messageCreators = {
  SendTx,
  StakeTx,
  UnstakeTx,
  ClaimRewardsTx,
  VoteTx,
  DepositTx,
};
