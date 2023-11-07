export enum VOTING_STATUS {
  PROPOSAL_STATUS_REJECTED = 'PROPOSAL_STATUS_REJECTED',
  PROPOSAL_STATUS_PASSED = 'PROPOSAL_STATUS_PASSED',
  PROPOSAL_STATUS_VOTING_PERIOD = 'PROPOSAL_STATUS_VOTING_PERIOD',
  PROPOSAL_STATUS_DEPOSIT_PERIOD = 'PROPOSAL_STATUS_DEPOSIT_PERIOD',
  PROPOSAL_STATUS_FAILED = 'PROPOSAL_STATUS_FAILED',
  PROPOSAL_STATUS_NOT_ENOUGH_DEPOSIT = 'PROPOSAL_STATUS_NOT_ENOUGH_DEPOSIT',
}

export const PROPOSAL_STATUS = [
  {
    key: VOTING_STATUS.PROPOSAL_STATUS_FAILED,
    value: 'failed',
    class: 'text--red-3',
  },
  {
    key: VOTING_STATUS.PROPOSAL_STATUS_REJECTED,
    value: 'rejected',
    class: 'text--red-3',
  },
  {
    key: VOTING_STATUS.PROPOSAL_STATUS_PASSED,
    value: 'passed',
    class: 'text--green-3',
  },
  {
    key: VOTING_STATUS.PROPOSAL_STATUS_VOTING_PERIOD,
    value: 'voting period',
    class: 'text--blue-2',
  },
  {
    key: VOTING_STATUS.PROPOSAL_STATUS_DEPOSIT_PERIOD,
    value: 'deposit period',
    class: 'text--yellow-3',
  },
];

export enum VOTE_OPTION {
  NULL = 'null',
  UNSPECIFIED = 'VOTE_OPTION_UNSPECIFIED',
  YES = 'VOTE_OPTION_YES',
  ABSTAIN = 'VOTE_OPTION_ABSTAIN',
  NO = 'VOTE_OPTION_NO',
  NO_WITH_VETO = 'VOTE_OPTION_NO_WITH_VETO',
  EMPTY = 'VOTE_OPTION_EMPTY',
}

export const PROPOSAL_VOTE = [
  {
    key: VOTE_OPTION.UNSPECIFIED,
    value: 'All',
    class: '',
    voteOption: '',
  },
  {
    key: VOTE_OPTION.YES,
    value: 'Yes',
    class: 'primary',
    voteOption: 'Yes',
  },
  {
    key: VOTE_OPTION.NO,
    value: 'No',
    class: 'danger',
    voteOption: 'No',
  },
  {
    key: VOTE_OPTION.NO_WITH_VETO,
    value: 'NoWithVeto',
    class: 'info',
    voteOption: 'NoWithVeto',
  },
  {
    key: VOTE_OPTION.ABSTAIN,
    value: 'Abstain',
    class: 'secondary',
    voteOption: 'Abstain',
  },
];

export const VOTING_FINAL_STATUS = [
  {
    key: VOTING_STATUS.PROPOSAL_STATUS_REJECTED,
    value: 'reject',
    class: 'text--danger',
  },
  {
    key: VOTING_STATUS.PROPOSAL_STATUS_PASSED,
    value: 'pass',
    class: 'text--primary',
  },
];

export enum VOTING_SUBTITLE {
  PASS = 'The proposal is passed because it is above the threshold and receive more than 50.00% of Yes votes, excluding Abstain votes.',
  REJECT_1 = 'This proposal is rejected because there are more than {{proposalDetail.noWithVetoPercent}}% of No With Veto votes.',
  REJECT_2 = 'This proposal is rejected because it is above the threshold and received more than 50.00% of No votes.',
  REJECT_3 = 'This proposal is failed because it did not reach the quorum.',
  FAILED = "This proposal is failed because the upgrade can't be executed",
}

export enum VOTING_QUORUM {
  REACHED = '(Reached)',
  NOT_REACHED = '(Not Reached)',
}

export enum PROPOSAL_TABLE_MODE {
  VOTES = 'VOTES',
  DEPOSITORS = 'DEPOSITORS',
  VALIDATORS_VOTES = 'VALIDATORS_VOTES',
}

export enum PROPOSAL_TYPE_COMMUNITY_POOL {
  V1BETA1 = '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
  V1 = '/cosmos.distribution.v1beta1.MsgCommunityPoolSpend',
}
