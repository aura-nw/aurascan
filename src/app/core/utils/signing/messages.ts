import { ChainInfo } from '@keplr-wallet/types';
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx';
import { MsgBeginRedelegate, MsgDelegate, MsgUndelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { MsgGrantAllowance, MsgRevokeAllowance } from 'cosmjs-types/cosmos/feegrant/v1beta1/tx';
import { BasicAllowance, PeriodicAllowance, AllowedMsgAllowance } from 'cosmjs-types/cosmos/feegrant/v1beta1/feegrant';
import { Timestamp } from 'cosmjs-types/google/protobuf/timestamp';
import { Duration } from 'cosmjs-types/google/protobuf/duration';
import { TRANSACTION_TYPE_ENUM } from '../../constants/transaction.enum';
import AllowedContractAllowance from './custom-feegrant';
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
  expiration: number;
}

export function GrantBasicAllowance(
  senderAddress: string,
  { granter, grantee, spendLimit, expiration }: IGrantBasicAllowance,
  network: ChainInfo,
) {
  let msgGrantAllowance;

  try {
    //set Basic allowance
    const basicAllowance = setBasicAllowance(expiration, spendLimit, network);

    msgGrantAllowance = MsgGrantAllowance.fromPartial({
      allowance: basicAllowance,
      grantee,
      granter,
    });
  } catch (e) {}

  return {
    typeUrl: TRANSACTION_TYPE_ENUM.MsgGrantAllowance,
    value: msgGrantAllowance || null,
  };
}

export interface IGrantPeriodicAllowance {
  granter: MsgGrantAllowance['granter'];
  grantee: MsgGrantAllowance['grantee'];
  spendLimit: number | string | null;
  expiration: number;
  period: Duration;
  periodSpendLimit: number;
}

export function GrantPeriodicAllowance(
  senderAddress: string,
  { granter, grantee, spendLimit, expiration, period, periodSpendLimit }: IGrantPeriodicAllowance,
  network: ChainInfo,
) {
  let msgGrantAllowance;

  try {
    //set Periodic allowance
    const periodicAllowance = setPeriodicAllowance(expiration, spendLimit, period, periodSpendLimit, network);

    msgGrantAllowance = MsgGrantAllowance.fromPartial({
      allowance: periodicAllowance,
      grantee,
      granter,
    });
  } catch (e) {}

  return {
    typeUrl: TRANSACTION_TYPE_ENUM.MsgGrantAllowance,
    value: msgGrantAllowance || null,
  };
}

export interface IGrantMsgAllowance {
  granter: MsgGrantAllowance['granter'];
  grantee: MsgGrantAllowance['grantee'];
  spendLimit: number | string | null;
  expiration: number;
  isPeriodic: boolean;
  isInstantiate: boolean;
  isExecute: boolean;
  period: Duration;
  periodSpendLimit: number;
  executeContract: string[];
}

export function GrantMsgAllowance(
  senderAddress: string,
  {
    granter,
    grantee,
    spendLimit,
    expiration,
    isPeriodic,
    isInstantiate,
    isExecute,
    period,
    periodSpendLimit,
    executeContract,
  }: IGrantMsgAllowance,
  network: ChainInfo,
) {
  let msgAllowance;

  try {
    let itemAllowance = {};
    //check type Basic/Periodic
    if (isPeriodic) {
      itemAllowance = setPeriodicAllowance(expiration, spendLimit, period, periodSpendLimit, network);
    } else {
      itemAllowance = setBasicAllowance(expiration, spendLimit, network);
    }

    let allowedMessages = [];
    if (isInstantiate) {
      allowedMessages.push(TRANSACTION_TYPE_ENUM.InstantiateContract);
    }
    if (isExecute) {
      allowedMessages.push(TRANSACTION_TYPE_ENUM.ExecuteContract);
    }

    let allowedAddress = [];
    if (executeContract) {
      executeContract.forEach((element) => {
        allowedAddress.push(element['address']);
      });
    }

    //comment allow message for version 0.45
    // const allowanceValue = {
    //   allowance: itemAllowance,
    //   allowedMessages: allowedMessages,
    // };

    // const allowanceEncode = AllowedMsgAllowance.encode(allowanceValue as any).finish();

    // const allowance = {
    //   typeUrl: TRANSACTION_TYPE_ENUM.AllowedMsgAllowance,
    //   value: Uint8Array.from(allowanceEncode),
    // };

    // const allowedContractMsg = {
    //   allowance: allowance,
    //   allowedAddress: allowedAddress.length > 0 ? allowedAddress : [],
    // };

    const allowedContractMsg = {
      allowance: itemAllowance,
      allowedAddress: allowedAddress.length > 0 ? allowedAddress : [],
    };

    const allowedContractEncode = AllowedContractAllowance.encode(allowedContractMsg).finish();

    const allowedContract = {
      typeUrl: TRANSACTION_TYPE_ENUM.AllowedContractAllowance,
      value: Uint8Array.from(allowedContractEncode),
    };

    msgAllowance = MsgGrantAllowance.fromPartial({
      allowance: allowedContract,
      grantee,
      granter,
    });
  } catch (e) {}

  return {
    typeUrl: TRANSACTION_TYPE_ENUM.MsgGrantAllowance,
    value: msgAllowance || null,
  };
}

export function setBasicAllowance(expiration, spendLimit, network) {
  let timestamp: Timestamp = undefined;

  if (expiration) {
    timestamp = Timestamp.fromPartial({
      seconds: expiration / 1000,
      nanos: 0,
    });
  }

  const allowanceValue: BasicAllowance = {
    spendLimit: spendLimit
      ? [
          {
            denom: network.currencies[0].coinMinimalDenom,
            amount: `${+spendLimit * Math.pow(10, network.currencies[0].coinDecimals)}`,
          },
        ]
      : [],
    expiration: timestamp ? timestamp : undefined,
  };

  const basicAllowance = {
    typeUrl: TRANSACTION_TYPE_ENUM.BasicAllowance,
    value: Uint8Array.from(BasicAllowance.encode(allowanceValue as any).finish()),
  };

  return basicAllowance;
}

export function setPeriodicAllowance(expiration, spendLimit, period, periodSpendLimit, network) {
  let timestamp: Timestamp = undefined;

  if (expiration) {
    timestamp = Timestamp.fromPartial({
      seconds: expiration / 1000,
      nanos: 0,
    });
  }

  let timestampPeriod: Duration = undefined;
  let periodReset: Timestamp = undefined;
  if (period) {
    timestampPeriod = Duration.fromPartial({
      seconds: period.toString(),
      nanos: 0,
    });
    let now = new Date();
    let timeReset = now?.getTime() / 1000 + Number(period);
    periodReset = Timestamp.fromPartial({
      seconds: timeReset,
      nanos: 0,
    });
  }

  let periodSpend = periodSpendLimit
    ? [
        {
          denom: network.currencies[0].coinMinimalDenom,
          amount: `${+periodSpendLimit * Math.pow(10, network.currencies[0].coinDecimals)}`,
        },
      ]
    : [];

  const allowanceValue: PeriodicAllowance = {
    basic: {
      spendLimit: spendLimit
        ? [
            {
              denom: network.currencies[0].coinMinimalDenom,
              amount: `${+spendLimit * Math.pow(10, network.currencies[0].coinDecimals)}`,
            },
          ]
        : [],
      expiration: timestamp,
    },
    period: timestampPeriod,
    periodSpendLimit: periodSpend,
    periodCanSpend: periodSpend,
    periodReset: periodReset,
  };

  const periodicAllowance = {
    typeUrl: TRANSACTION_TYPE_ENUM.PeriodicAllowance,
    value: Uint8Array.from(PeriodicAllowance.encode(allowanceValue as any).finish()),
  };

  return periodicAllowance;
}

export function RevokeAllowance(senderAddress: string, { granter, grantee }: IGrantBasicAllowance, network: ChainInfo) {
  const msgRevokeAllowance = MsgRevokeAllowance.fromPartial({
    grantee,
    granter,
  });

  return {
    typeUrl: TRANSACTION_TYPE_ENUM.MsgRevokeAllowance,
    value: msgRevokeAllowance || null,
  };
}

export const messageCreators = {
  Delegate,
  Undelegate,
  GetReward,
  Vote,
  Redelegate,
  GrantBasicAllowance,
  GrantPeriodicAllowance,
  GrantMsgAllowance,
  RevokeAllowance,
};
