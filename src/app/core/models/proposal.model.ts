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
