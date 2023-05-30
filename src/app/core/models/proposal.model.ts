export interface IListVoteQuery {
  proposalId: number;
  pageLimit: number;
  nextKey?: string;
}

export interface IListVoteValidatorQuery {
  proposalId: number;
  option: string;
  limit: number;
  offset: number;
}

export interface IListVotesRes {
  result: {
    countAbstain: number;
    countNo: number;
    countNoWithVeto: number;
    countTotal: number;
    countYes: number;
    proposalVotes: IListVotes[];
  };
}

export interface IListVotes {}

export interface IProposal {
  proposal_id: number;
  proposer_name: string;
  proposer_address: string;
  status: string;
  submit_time: string;
  content: {
    title: string;
  };
  total_deposit: { amount: number; denom: string };
  tally: {
    abstain: number;
    no: number;
    no_with_veto: number;
    yes: number;
  };
  final_tally_result: {
    abstain: number;
    no: number;
    no_with_veto: number;
    yes: number;
  };
  voting_end_time: string;
  voting_start_time: string;
  pro_vote_total?: number;
  pro_turnout: string;
  quorum: number;
  vote_option: string;
}

export interface IVotingDialog {
  [key: string]: any;
  id: number;
  title: string;
  voteValue: string;
}

export interface IVotingInfo {
  result: {
    created_at: string;
    updated_at: string;
    id: number;
    delegator_address: string;
    validator_address: string;
    shares: string;
    amount: string;
    tx_hash: string;
    type: string;
  };
}
