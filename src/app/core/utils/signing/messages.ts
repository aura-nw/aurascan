import { ChainInfo } from '@keplr-wallet/types';
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx';
import { MsgBeginRedelegate, MsgDelegate, MsgUndelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { MsgGrantAllowance } from 'cosmjs-types/cosmos/feegrant/v1beta1/tx';
import { BasicAllowance } from 'cosmjs-types/cosmos/feegrant/v1beta1/feegrant';
import { Any } from 'cosmjs-types/google/protobuf/any';
import { TRANSACTION_TYPE_ENUM } from '../../constants/transaction.enum';
import * as Long from 'long';

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

export interface IGrantBasicAllowance {
  granter: MsgGrantAllowance['granter'];
  grantee: MsgGrantAllowance['grantee'];
  spendLimit: number | string | null;
  expiration: Date;
}

export function GrantBasicAllowance(
  senderAddress: string,
  { granter, grantee, spendLimit, expiration }: IGrantBasicAllowance,
  network: ChainInfo,
) {
  const allowanceValue: BasicAllowance = {
    spendLimit: spendLimit
      ? [
          {
            denom: network.currencies[0].coinMinimalDenom,
            amount: `${+spendLimit * Math.pow(10, network.currencies[0].coinDecimals)}`,
          },
        ]
      : [],
    expiration: {
      seconds: Long.fromString(expiration.toString()),
      nanos: 1,
    },
  };

  let basicAllowance;

  try {
    basicAllowance = {
      typeUrl: TRANSACTION_TYPE_ENUM.BasicAllowance,
      value: Uint8Array.from(BasicAllowance.encode(allowanceValue).finish()),
    };
  } catch (e) {
    console.log('🐛 Debug', e);
  }

  const msgGrantAllowance = MsgGrantAllowance.fromPartial({
    allowance: basicAllowance,
    grantee,
    granter,
  });

  return {
    typeUrl: TRANSACTION_TYPE_ENUM.MsgGrantAllowance,
    value: msgGrantAllowance,
  };
}

export const messageCreators = {
  Delegate,
  Undelegate,
  GetReward,
  Vote,
  Redelegate,
  GrantBasicAllowance,
};
