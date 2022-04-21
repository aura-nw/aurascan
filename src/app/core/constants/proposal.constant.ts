export const PROPOSAL_STATUS = [
    {
        key: 'PROPOSAL_STATUS_REJECTED',
        value: 'rejected',
        class: 'text--danger'
    },
    {
        key: 'PROPOSAL_STATUS_PASSED',
        value: 'passed',
        class: 'text--primary'
    },
    {
        key: 'PROPOSAL_STATUS_VOTING_PERIOD',
        value: 'voting period',
        class: 'text--info'
    },
    {
        key: 'PROPOSAL_STATUS_DEPOSIT_PERIOD',
        value: 'deposit period',
        class: 'text--warning'
    }
];

export const PROPOSAL_VOTE = [
    {
        key: 'VOTE_OPTION_UNSPECIFIED',
        value: 'All',
        class: '',
        voteOption: ''
    },
    {
        key: 'VOTE_OPTION_YES',
        value: 'Yes',
        class: 'primary',
        voteOption: 'Yes'
    },
    {
        key: 'VOTE_OPTION_NO',
        value: 'No',
        class: 'danger',
        voteOption: 'No'
    },
    {
        key: 'VOTE_OPTION_NO_WITH_VETO',
        value: 'No with veto',
        class: 'info',
        voteOption: 'NoWithVeto'
    },
    {
        key: 'VOTE_OPTION_ABSTAIN',
        value: 'Abstain',
        class: 'secondary',
        voteOption: 'Abstain'
    }
];


export enum MESSAGE_WARNING {
    NOT_PARTICIPATE,//: `You don't have the right to vote on this proposal because you are a unbonded Aura holder. Staking now to have the right to vote on other later proposals`,
    LATE//: `You don't have the right to vote on this proposal because the voting period of this proposal started before you stake Aura.`
}