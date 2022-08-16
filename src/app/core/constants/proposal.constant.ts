export enum VOTING_STATUS {
  PROPOSAL_STATUS_REJECTED = 'PROPOSAL_STATUS_REJECTED',
  PROPOSAL_STATUS_PASSED = 'PROPOSAL_STATUS_PASSED',
  PROPOSAL_STATUS_VOTING_PERIOD = 'PROPOSAL_STATUS_VOTING_PERIOD',
  PROPOSAL_STATUS_DEPOSIT_PERIOD = 'PROPOSAL_STATUS_DEPOSIT_PERIOD',
  PROPOSAL_STATUS_FAILED = 'PROPOSAL_STATUS_FAILED',
}

export const PROPOSAL_STATUS = [
  {
    key: VOTING_STATUS.PROPOSAL_STATUS_FAILED,
    value: 'rejected',
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
  VOTE_OPTION_NULL = 'null',
  VOTE_OPTION_UNSPECIFIED = 'VOTE_OPTION_UNSPECIFIED',
  VOTE_OPTION_YES = 'VOTE_OPTION_YES',
  VOTE_OPTION_ABSTAIN = 'VOTE_OPTION_ABSTAIN',
  VOTE_OPTION_NO = 'VOTE_OPTION_NO',
  VOTE_OPTION_NO_WITH_VETO = 'VOTE_OPTION_NO_WITH_VETO',
}

export const PROPOSAL_VOTE = [
  {
    key: VOTE_OPTION.VOTE_OPTION_UNSPECIFIED,
    value: 'All',
    class: '',
    voteOption: '',
  },
  {
    key: VOTE_OPTION.VOTE_OPTION_YES,
    value: 'Yes',
    class: 'primary',
    voteOption: 'Yes',
  },
  {
    key: VOTE_OPTION.VOTE_OPTION_NO,
    value: 'No',
    class: 'danger',
    voteOption: 'No',
  },
  {
    key: VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO,
    value: 'No with veto',
    class: 'info',
    voteOption: 'NoWithVeto',
  },
  {
    key: VOTE_OPTION.VOTE_OPTION_ABSTAIN,
    value: 'Abstain',
    class: 'secondary',
    voteOption: 'Abstain',
  },
];

export enum MESSAGE_WARNING {
  NOT_PARTICIPATE = 'NOT_PARTICIPATE',
  LATE = 'LATE',
}

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
}

export enum VOTING_QUORUM {
  REACHED= '(Reached)',
  NOT_REACHED = '(Not Reached)',
}
