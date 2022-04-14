export const PROPOSAL_STATUS = [
    {
        key: 'PROPOSAL_STATUS_REJECTED',
        value: 'rejected',
        class: 'danger'
    },
    {
        key: 'PROPOSAL_STATUS_PASSED',
        value: 'passed',
        class: 'primary'
    },
    {
        key: 'PROPOSAL_STATUS_VOTING_PERIOD',
        value: 'voting period',
        class: 'info'
    },
    {
        key: 'PROPOSAL_STATUS_DEPOSIT_PERIOD',
        value: 'deposit period',
        class: 'warning'
    }
];

export const PROPOSAL_VOTE = [
    {
        key: 0,
        value: '',
        class: '',
        enum: 'VOTE_OPTION_UNSPECIFIED',
        voteOption: ''
    },
    {
        key: 1,
        value: 'Yes',
        class: 'primary',
        enum: 'VOTE_OPTION_YES',
        voteOption: 'Yes'
    },
    {
        key: 2,
        value: 'Abstain',
        class: 'secondary',
        enum: 'VOTE_OPTION_ABSTAIN',
        voteOption: 'Abstain'
    },
    {
        key: 3,
        value: 'No',
        class: 'danger',
        enum: 'VOTE_OPTION_NO',
        voteOption: 'No'
    },
    {
        key: 4,
        value: 'No with veto',
        class: 'info',
        enum: 'VOTE_OPTION_NO_WITH_VETO',
        voteOption: 'NoWithVeto'
    }
];
