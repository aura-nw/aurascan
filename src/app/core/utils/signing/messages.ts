import { ChainInfo } from '@keplr-wallet/types';
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx';
import { MsgDelegate, MsgUndelegate, MsgBeginRedelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';

// Staking
export function Delegate(senderAddress, { to, amount }, network: ChainInfo) {
  /* istanbul ignore next */
  const msg = MsgDelegate.fromPartial({
    delegatorAddress: senderAddress,
    validatorAddress: to[0],
    amount: {
      amount: amount.amount + '',
      denom: network.currencies[0].coinMinimalDenom,
    },
  });
  return {
    typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
    value: msg,
  };
}

export function Undelegate(senderAddress, { from, amount }, network: ChainInfo) {
  /* istanbul ignore next */
  return {
    typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
    value: MsgUndelegate.fromPartial({
      delegatorAddress: senderAddress,
      validatorAddress: from[0],
      amount: {
        amount: amount.amount + '',
        denom: network.currencies[0].coinMinimalDenom,
      },
    }),
  };
}

export function GetReward(
  senderAddress,
  {
    // amounts,
    from,
  },
) {
  const msg = [];

  //loop list validator for get reward
  from.forEach((f) => {
    msg.push({
      typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
      value: MsgWithdrawDelegatorReward.fromPartial({
        delegatorAddress: senderAddress,
        validatorAddress: f.validator_address,
      }),
    });
  });

  return msg;
}

export function Vote(senderAddress, { proposalId, voteOption }) {
  const chainVoteOption = {
    Yes: 1,
    Abstain: 2,
    No: 3,
    NoWithVeto: 4,
  }[voteOption];
  /* istanbul ignore next */
  return {
    typeUrl: '/cosmos.gov.v1beta1.MsgVote',
    value: {
      voter: senderAddress,
      proposalId,
      option: chainVoteOption,
    },
  };
}

// ReStaking
export function Redelegate(senderAddress, { src_address, to_address, amount }, network) {
  /* istanbul ignore next */
  const msg = MsgBeginRedelegate.fromPartial({
    delegatorAddress: senderAddress,
    validatorSrcAddress: src_address,
    validatorDstAddress: to_address,
    amount: {
      amount: amount.amount + '',
      denom: network.currencies[0].coinMinimalDenom,
    },
  });
  return {
    typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
    value: msg,
  };
}

export const messageCreators = {
  Delegate,
  Undelegate,
  GetReward,
  Vote,
  Redelegate,
};
