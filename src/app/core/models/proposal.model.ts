export interface IListVoteQuery {
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
  pro_id: number;
  pro_proposer: string;
  pro_proposer_address: string;
  pro_status: string;
  pro_submit_time: string;
  pro_title: string;
  pro_total_deposits: number;
  pro_votes_abstain: number;
  pro_votes_no: number;
  pro_votes_no_with_veto: number;
  pro_votes_yes: number;
  pro_voting_end_time: string;
  pro_voting_start_time: string;
  pro_vote_total?: number;
}
