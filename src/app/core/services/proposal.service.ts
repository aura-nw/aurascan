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
    query auratestnet_proposal($limit: Int = 10, $nextKey: Int = null, $order: order_by = desc, $proposalId: Int = null) {
      ${envDB} {
        proposal(limit: $limit, where: {proposal_id: {_eq: $proposalId, _lt: $nextKey}}, order_by: {proposal_id: $order}) {
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
  }`;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload.limit,
          order: 'desc',
          nextKey: payload.nextKey,
          proposalId: payload.proposalId,
        },
        operationName: 'auratestnet_proposal',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListVoteFromIndexerV2(payload, option): Observable<any> {
    const operationsDoc = `
    query auratestnet_vote($limit: Int = 10, $order: order_by = desc, $proposalId: Int = null, $voteOption: String = null) {
      ${this.envDB} {
        vote(limit: $limit, where: {proposal_id: {_eq: $proposalId}, vote_option: {_eq: $voteOption}}, order_by: {proposal_id: $order, txhash: asc}) {
          height
          proposal_id
          txhash
          updated_at
          vote_option
          voter
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload.pageLimit,
          // nextKey: payload.nextKey,
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
