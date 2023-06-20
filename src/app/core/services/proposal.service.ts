import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { VOTE_OPTION } from '../constants/proposal.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { map } from 'rxjs/operators';

@Injectable()
export class ProposalService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;
  maxValidator = `${this.environmentService.configValue.maxValidator}`;
  reloadList$ = new Subject();

  reloadList() {
    this.reloadList$.next(true);
  }

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getValidatorVotesFromIndexer(
    proposalId: number,
    { limit, offset }: { limit: number; offset?: number; voteOption?: string },
  ): Observable<any> {
    const operationsDoc = `
    query queryValidatorVotes($proposalId: Int = null, $limit: Int = 10, $offset: Int = 0) {
      ${this.envDB} {
        validator(where: {status: {_eq: "BOND_STATUS_BONDED"}}, order_by: {percent_voting_power: desc}, limit: $limit, offset: $offset) {
          vote(where: {proposal_id: {_eq: $proposalId}}) {
            id
            vote_option
            txhash
            proposal_id
            updated_at
          }
          description
          operator_address
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          proposalId: proposalId,
          limit: limit,
          offset: offset || 0,
        },
        operationName: 'queryValidatorVotes',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getProposalData({
    limit,
    offset,
    proposalId,
    type,
  }: {
    limit: number;
    offset?: number;
    proposalId?: number;
    type?: string;
  }) {
    const operationsDoc = `
    query queryProposal($limit: Int = 10, $offset: Int = 0, $order: order_by = desc, $proposalId: Int = null, $type: String = null, $n_status : String = "PROPOSAL_STATUS_NOT_ENOUGH_DEPOSIT") {
      ${this.envDB} {
        proposal(limit: $limit, offset: $offset, where: {proposal_id: {_eq: $proposalId}, type: {_eq: $type}, status: {_neq: $n_status}}, order_by: {proposal_id: $order}) {
          content
          deposit_end_time
          description
          initial_deposit
          proposal_id
          proposer_address
          count_vote
          proposer {
            description
            operator_address
            account_address
          }
          status
          submit_time
          tally
          title
          total_deposit
          turnout
          type
          updated_at
          voting_end_time
          voting_start_time
        }
        proposal_aggregate(where: {proposal_id: {_eq: $proposalId}, type: {_eq: $type}, status: {_neq: "PROPOSAL_STATUS_NOT_ENOUGH_DEPOSIT"}}) {
          aggregate {
            count
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          n_status: 'PROPOSAL_STATUS_NOT_ENOUGH_DEPOSIT',
          order: 'desc',
          limit,
          offset,
          proposalId,
          type,
        },
        operationName: 'queryProposal',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListVoteFromIndexer(payload, option): Observable<any> {
    const operationsDoc = `
    query queryVote($limit: Int = 10, $offset: Int = 0, $order: order_by = desc, $proposalId: Int = null, $voteOption: String = null) {
      ${this.envDB} {
        vote(limit: $limit, offset: $offset, where: {proposal_id: {_eq: $proposalId}, vote_option: {_eq: $voteOption}}, order_by: {height: $order}) {
          height
          proposal_id
          txhash
          vote_option
          voter
          transaction {
            timestamp
          }
        }
        vote_aggregate(where: {proposal_id: {_eq: $proposalId}, vote_option: {_eq: $voteOption}}) {
          aggregate {
            count
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload.pageLimit,
          order: 'desc',
          proposalId: payload.proposalId,
          voteOption: option || null,
          offset: payload?.offset,
        },
        operationName: 'queryVote',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getProposalVoteTotal(proposalId: number) {
    const operationsDoc = `
    query queryProposalVoteTotal($proposalId: Int) {
      ${this.envDB} {
        ALL: vote_aggregate(where: {proposal_id: {_eq: $proposalId}}) {
          ...aggregateCountFragment
        }
        VOTE_OPTION_YES: vote_aggregate(where: {proposal_id: {_eq: $proposalId}, vote_option: {_eq: "VOTE_OPTION_YES"}}) {
          ...aggregateCountFragment
        }
        VOTE_OPTION_ABSTAIN: vote_aggregate(where: {proposal_id: {_eq: $proposalId}, vote_option: {_eq: "VOTE_OPTION_ABSTAIN"}}) {
          ...aggregateCountFragment
        }
        VOTE_OPTION_NO: vote_aggregate(where: {proposal_id: {_eq: $proposalId}, vote_option: {_eq: "VOTE_OPTION_NO"}}) {
          ...aggregateCountFragment
        }
        VOTE_OPTION_NO_WITH_VETO: vote_aggregate(where: {proposal_id: {_eq: $proposalId}, vote_option: {_eq: "VOTE_OPTION_NO_WITH_VETO"}}) {
          ...aggregateCountFragment
        }
      }
    }
    
    fragment aggregateCountFragment on ${this.envDB}_vote_aggregate {
      aggregate {
        count
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: { proposalId },
        operationName: 'queryProposalVoteTotal',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getVoteMessageByConstant(option: any) {
    if (typeof option === 'string') {
      return option;
    }
    let result = '';
    switch (option) {
      case 1:
        result = VOTE_OPTION.YES;
        break;
      case 2:
        result = VOTE_OPTION.ABSTAIN;
        break;
      case 3:
        result = VOTE_OPTION.NO;
        break;
      case 4:
        result = VOTE_OPTION.NO_WITH_VETO;
        break;
      default:
        result = VOTE_OPTION.EMPTY;
        break;
    }
    return result;
  }
}
