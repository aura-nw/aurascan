import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { VOTE_OPTION } from '../constants/proposal.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { checkEnvQuery } from '../utils/common/info-common';
import { map } from 'rxjs/operators';

@Injectable()
export class ProposalService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;
  indexerUrl = `${this.environmentService.configValue.indexerUri}`;
  graphUrl = `${this.environmentService.configValue.graphUrl}`;
  envDB = checkEnvQuery(this.environmentService.configValue.env);
  reloadList$ = new Subject();
  pageIndexObj = {};

  reloadList() {
    this.reloadList$.next(true);
  }

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getValidatorVotesFromIndexer(proposalid): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      proposalid: proposalid,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/votes/validators`, { params });
  }

  getListVoteFromIndexer(payload, option): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      nextKey: payload.nextKey,
      reverse: false,
      pageLimit: payload.pageLimit,
      answer: option,
      proposalid: payload.proposalid,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/votes`, { params });
  }

  getProposalData(payload) {
    const envDB = checkEnvQuery(this.environmentService.configValue.env);
    const operationsDoc = `
    query auratestnet_proposal($limit: Int = 10, $offset: Int = 0, $order: order_by = desc, $proposalId: Int = 10) {
      ${envDB} {
        proposal(limit: $limit, offset: $offset, where: {proposal_id: {_eq: $proposalId}}, order_by: {proposal_id: $order}) {
          content
          deposit_end_time
          description
          initial_deposit
          proposal_id
          proposer_address
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
          offset: 0,
          order: 'desc',
          proposalId: payload.proposalId,
        },
        operationName: 'auratestnet_proposal',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
  
  getProposalList(payload, proposal_id = '') {
    const limit = payload.limit;
    const nextKey = payload.nextKey;

    let updateQuery = '';
    if (payload.nextKey !== null) {
      updateQuery =
        ', where: {proposal_id: {_lt: ' + nextKey + ', _lte:' + (nextKey - 40 > 0 ? nextKey - 40 : 1) + '}}';
    }
    if (proposal_id !== '') {
      updateQuery = ', where: {proposal_id: {_eq: ' + proposal_id + '}}';
    }
    const envDB = checkEnvQuery(this.environmentService.configValue.env);
    const operationsDoc = `
    query getListProposal ($limit: Int) {
      ${envDB} {
        proposal (limit: $limit, order_by: {proposal_id: desc} ${updateQuery}) {
          tally
          proposal_id
          content
          status
          proposer_address
          title
          voting_end_time
          voting_start_time
          total_deposit
          submit_time
          initial_deposit
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: { limit: limit },
        operationName: 'getListProposal',
      })
      .pipe(map((res) => (res?.data ? res?.data[envDB] : null)));
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
