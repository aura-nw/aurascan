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

  getVotes(payload): Observable<any> {
    const operationsDoc = `
    query getVotes($proposalId: String, $tx_msg_val: jsonb) {
      ${this.envDB} {
        transaction(order_by: {timestamp: desc}, limit: 1, where: {transaction_messages: {type: {_eq: "/cosmos.gov.v1beta1.MsgVote"}, content: {_contains: $tx_msg_val}}, event_attributes: {key: {_eq: "proposal_id"}, value: {_eq: $proposalId}}}) {
          height
          data
        }
      }
    }    
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          proposalId: payload.proposalId.toString(),
          tx_msg_val: {
            voter: payload.wallet,
          },
        },
        operationName: 'getVotes',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  // getVotes(payload) {
  //   const params = _({
  //     chainid: this.chainInfo.chainId,
  //     searchValue: payload.proposalId,
  //     searchType: 'proposal_vote',
  //     searchKey: 'proposal_id',
  //     ['queryAnd[]']: 'transfer.sender='+payload.wallet,
  //   })
  //     .omitBy(_.isNull)
  //     .omitBy(_.isUndefined)
  //     .value();

  //   return this.http.get<any>(`${this.indexerUrl}/transaction`, { params });
  // }

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

  getDepositors(payload) {
    const operationsDoc = `
    query getDepositors($limit: Int, $proposalId: String) {
      ${this.envDB} {
        transaction(limit: $limit, order_by: {timestamp: desc}, where: {event_attributes: {key: {_eq: "proposal_id"}, value: {_eq: $proposalId}}, events: {type: {_eq: "proposal_deposit"} }}) {
          hash
          timestamp
          data(path:"tx")
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload.pageLimit,
          proposalId: payload.proposalId.toString(),
        },
        operationName: 'getDepositors',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  // getDepositors(payload) {
  //   const params = _({
  //     chainid: this.chainInfo.chainId,
  //     searchValue: payload.proposalId,
  //     searchType: 'proposal_deposit',
  //     searchKey: 'proposal_id',
  //     pageLimit: payload.pageLimit,
  //     nextKey: payload.nextKey,
  //     // countTotal: true,
  //   })
  //     .omitBy(_.isNull)
  //     .omitBy(_.isUndefined)
  //     .value();

  //   return this.http.get<any>(`${this.indexerUrl}/transaction`, { params });
  // }

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

  getProposalList(pageLimit = 20, nextKey = null, proposalId = null): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      pageLimit: pageLimit,
      nextKey,
      reverse: false,
      proposalId: proposalId,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/proposal`, { params });
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
