import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { VOTE_OPTION } from '../constants/proposal.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class ProposalService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;
  indexerUrl = `${this.environmentService.configValue.indexerUri}`;
  reloadList$ = new Subject();

  reloadList() {
    this.reloadList$.next(true);
  }

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getVotes(payload) {
    const params = _({
      chainid: this.chainInfo.chainId,
      searchValue: payload.proposalId,
      searchType: 'proposal_vote',
      searchKey: 'proposal_id',
      ['queryAnd[]']: 'transfer.sender='+payload.wallet,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/transaction`, { params });
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

  getDepositors(payload) {
    const params = _({
      chainid: this.chainInfo.chainId,
      searchValue: payload.proposalId,
      searchType: 'proposal_deposit',
      searchKey: 'proposal_id',
      pageLimit: payload.pageLimit,
      nextKey: payload.nextKey,
      countTotal: true,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/transaction`, { params });
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
    let result = '';
    if (typeof option === 'string') {
      result = option;
    }
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
