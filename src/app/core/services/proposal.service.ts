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
  indexerUrl = `${this.environmentService.configValue.indexerUri}`;
  graphUrl = `${this.environmentService.configValue.graphUrl}`;
  maxValidator = `${this.environmentService.configValue.maxValidator}`;
  envDB = this.environmentService.configValue.horoscopeSelectedChain;
  reloadList$ = new Subject();
  pageIndexObj = {};

  reloadList() {
    this.reloadList$.next(true);
  }

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getValidatorVotesFromIndexer(proposalId): Observable<any> {
    const operationsDoc = `
    query auratestnet_validator($proposalId: Int = null, $limit: Int = 10) {
      ${this.envDB} {
        validator(where: {status: {_eq: "BOND_STATUS_BONDED"}}, order_by: {percent_voting_power: desc}, limit: $limit) {
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
          limit: +this.maxValidator || 100,
          proposalId: proposalId,
        },
        operationName: 'auratestnet_validator',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getProposalData(payload) {
    const operationsDoc = `
    query auratestnet_proposal($limit: Int = 10, $nextKey: Int = null, $order: order_by = desc, $proposalId: Int = null, $type: String = null) {
      ${this.envDB} {
        proposal(limit: $limit, where: {proposal_id: {_eq: $proposalId, _lt: $nextKey}, type: {_eq: $type}}, order_by: {proposal_id: $order}) {
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
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload.limit,
          order: 'desc',
          nextKey: payload.nextKey,
          proposalId: payload.proposalId,
          type: payload.type
        },
        operationName: 'auratestnet_proposal',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListVoteFromIndexer(payload, option): Observable<any> {
    const operationsDoc = `
    query auratestnet_vote($limit: Int = 10, $nextKey: Int = null, $order: order_by = desc, $proposalId: Int = null, $voteOption: String = null) {
      ${this.envDB} {
        vote(limit: $limit, where: {proposal_id: {_eq: $proposalId}, height: {_lt: $nextKey}, vote_option: {_eq: $voteOption}}, order_by: {height: $order}) {
          height
          proposal_id
          txhash
          vote_option
          voter
          transaction {
            timestamp
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
          nextKey: payload.nextKey,
          order: 'desc',
          proposalId: payload.proposalId,
          voteOption: option || null,
        },
        operationName: 'auratestnet_vote',
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
        result = VOTE_OPTION.VOTE_OPTION_YES;
        break;
      case 2:
        result = VOTE_OPTION.VOTE_OPTION_ABSTAIN;
        break;
      case 3:
        result = VOTE_OPTION.VOTE_OPTION_NO;
        break;
      case 4:
        result = VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO;
        break;
      default:
        result = VOTE_OPTION.VOTE_OPTION_EMPTY;
        break;
    }
    return result;
  }
}
